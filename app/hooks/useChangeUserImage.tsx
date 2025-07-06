import { storage } from "@/libs/AppWriteClient";

const useChangeUserImage = async (
  file: File,
  cropper: any,
  currentImage: string
) => {
  const videoId = Math.random().toString(36).slice(2, 22);

  try {
    // Create image element
    const img = new Image();
    img.src = URL.createObjectURL(file);

    // Wait for image to load
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const { left: x, top: y, width, height } = cropper;

    // Create canvas for cropping
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = width;
    cropCanvas.height = height;
    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) throw new Error("Could not get canvas context");

    // Perform cropping
    cropCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

    // Create canvas for resizing
    const resizeCanvas = document.createElement("canvas");
    resizeCanvas.width = 200;
    resizeCanvas.height = 200;
    const resizeCtx = resizeCanvas.getContext("2d");

    if (!resizeCtx) throw new Error("Could not get canvas context");

    // Perform resizing
    resizeCtx.drawImage(cropCanvas, 0, 0, 200, 200);

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      resizeCanvas.toBlob(resolve, "image/png", 1);
    });

    if (!blob) throw new Error("Failed to create image blob");

    // Create file and upload
    const finalFile = new File([blob], file.name, { type: "image/png" });
    const result = await storage.createFile(
      String(process.env.NEXT_PUBLIC_BUCKET_ID),
      videoId,
      finalFile
    );

    // Delete old image if needed
    if (
      currentImage !==
      String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEAFULT_IMAGE_ID)
    ) {
      await storage.deleteFile(
        String(process.env.NEXT_PUBLIC_BUCKET_ID),
        currentImage
      );
    }

    return result?.$id;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

export default useChangeUserImage;
