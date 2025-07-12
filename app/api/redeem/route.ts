import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { itemId, userId, idToken } = await req.json();

    if (!itemId || !userId || !idToken) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the item
    const itemRef = db.collection('items').doc(itemId);
    const itemDoc = await itemRef.get();
    const itemData = itemDoc.data();
    if (!itemDoc.exists || !itemData || itemData.status !== 'available') {
      return NextResponse.json({ error: 'Item not available' }, { status: 400 });
    }

    // Get the user (requester)
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    if (!userDoc.exists || !userData || userData.points < 50) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Get the owner
    const ownerRef = db.collection('users').doc(itemData.uploaderId);
    const ownerDoc = await ownerRef.get();
    const ownerData = ownerDoc.exists ? ownerDoc.data() : { points: 0 };

    // Perform updates in a transaction
    await db.runTransaction(async (transaction) => {
      transaction.update(itemRef, { status: 'redeemed', redeemedBy: userId });
      transaction.update(userRef, { points: userData.points - 50 });
      transaction.update(ownerRef, { points: ((ownerData?.points ?? 0) + 50) });
    });

    return NextResponse.json({ message: 'Item redeemed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error redeeming item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}