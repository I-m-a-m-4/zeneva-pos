import { ImageResponse } from "next/og";

// Metadata
export const alt = "Zeneva POS & Inventory Management";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Generate icon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "black",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Z
      </div>
    ),
    size
  );
}
