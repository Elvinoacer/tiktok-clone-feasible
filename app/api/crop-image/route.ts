// app/api/crop-image/route.ts
import { NextResponse } from "next/server";
import { createCanvas, Image } from "@napi-rs/canvas";

export const config = {
  runtime: "nodejs", // Ensure this runs in Node.js environment
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const cropper = JSON.parse(formData.get("cropper") as string);

    if (!file || !cropper) {
      return NextResponse.json(
        { error: "Missing file or cropper data" },
        { status: 400 }
      );
    }

    const x = cropper.left;
    const y = cropper.top;
    const width = cropper.width;
    const height = cropper.height;

    const imageBuffer = await file.arrayBuffer();
    const img = new Image();
    img.src = new Uint8Array(imageBuffer);

    // Crop and resize
    const cropCanvas = createCanvas(width, height);
    const cropCtx = cropCanvas.getContext("2d");
    cropCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

    const resizeCanvas = createCanvas(200, 200);
    const resizeCtx = resizeCanvas.getContext("2d");
    resizeCtx.drawImage(cropCanvas, 0, 0, width, height, 0, 0, 200, 200);

    const buffer = resizeCanvas.toBuffer("image/png");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="cropped.png"',
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
