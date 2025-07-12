export const uploadToCloudinary = async (file: File): Promise<string> => {
  // Function to fetch signature and timestamp from the API route
  const getSignature = async () => {
    const response = await fetch('/api/cloudinary-signature');
    if (!response.ok) {
      throw new Error('Failed to get signature');
    }
    const data = await response.json();
    return data;
  };

  const { signature, timestamp } = await getSignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error("Cloudinary upload failed");
  }
  return data.secure_url;
};