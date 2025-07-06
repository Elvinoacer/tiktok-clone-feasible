// import { storage } from "@/libs/AppWriteClient";
// import { createCanvas, Image } from "@napi-rs/canvas";

// const useChangeUserImage = async (
//   file: File,
//   cropper: any,
//   currentImage: string
// ) => {
//   let videoId = Math.random().toString(36).slice(2, 22);

//   const x = cropper.left;
//   const y = cropper.top;
//   const width = cropper.width;
//   const height = cropper.height;

//   try {
//     const response = await fetch(URL.createObjectURL(file));
//     const imageBuffer = await response.arrayBuffer();

//     const img = new Image();
//     img.src = new Uint8Array(imageBuffer);

//     // Crop the image using canvas
//     const cropCanvas = createCanvas(width, height);
//     const cropCtx = cropCanvas.getContext("2d");
//     cropCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

//     // Resize the cropped image to 200x200
//     const resizeCanvas = createCanvas(200, 200);
//     const resizeCtx = resizeCanvas.getContext("2d");
//     resizeCtx.drawImage(cropCanvas, 0, 0, width, height, 0, 0, 200, 200);

//     // Convert canvas to buffer and then to Blob/File
//     const buffer = resizeCanvas.toBuffer("image/png");
//     const finalFile = new File([buffer], file.name, { type: "image/png" });
//     const result = await storage.createFile(
//       String(process.env.NEXT_PUBLIC_BUCKET_ID),
//       videoId,
//       finalFile
//     );

//     // if current image is not default image delete
//     if (
//       currentImage !=
//       String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEAFULT_IMAGE_ID)
//     ) {
//       await storage.deleteFile(
//         String(process.env.NEXT_PUBLIC_BUCKET_ID),
//         currentImage
//       );
//     }

//     return result?.$id;
//   } catch (error) {
//     throw error;
//   }
// };

// export default useChangeUserImage;

// app/hooks/useChangeUserImage.ts
import { storage } from "@/libs/AppWriteClient";

const useChangeUserImage = async (
  file: File,
  cropper: any,
  currentImage: string
) => {
  const videoId = Math.random().toString(36).slice(2, 22);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cropper", JSON.stringify(cropper));

    const response = await fetch("/api/crop-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Image processing failed");

    const blob = await response.blob();
    const finalFile = new File([blob], file.name, { type: "image/png" });

    // Upload to Appwrite
    const result = await storage.createFile(
      String(process.env.NEXT_PUBLIC_BUCKET_ID),
      videoId,
      finalFile
    );

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
    throw error;
  }
};

export default useChangeUserImage;
