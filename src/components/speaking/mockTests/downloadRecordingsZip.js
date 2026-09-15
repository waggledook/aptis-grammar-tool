function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.byteLength;
  });
  return output;
}

function uint16(value) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function uint32(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let checksum = index;
    for (let bit = 0; bit < 8; bit += 1) {
      checksum = checksum & 1 ? 0xedb88320 ^ (checksum >>> 1) : checksum >>> 1;
    }
    table[index] = checksum >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let checksum = -1;
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 1) {
    checksum = (checksum >>> 8) ^ CRC_TABLE[(checksum ^ bytes[index]) & 0xff];
  }
  return (checksum ^ -1) >>> 0;
}

export async function downloadRecordingsZip(recordings = [], zipName = "aptis-speaking-responses.zip") {
  const files = recordings.filter((recording) => recording?.blob && recording?.filename);
  if (!files.length) return;

  const encoder = new TextEncoder();
  const localParts = [];
  const centralDirectory = [];
  let offset = 0;

  for (const file of files) {
    const data = await file.blob.arrayBuffer();
    const name = encoder.encode(file.filename);
    const checksum = crc32(data);
    const size = data.byteLength;
    const localHeader = concatBytes([
      uint32(0x04034b50), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0),
      uint32(checksum), uint32(size), uint32(size), uint16(name.length), uint16(0), name,
    ]);

    localParts.push(localHeader, new Uint8Array(data));
    centralDirectory.push(concatBytes([
      uint32(0x02014b50), uint16(20), uint16(20), uint16(0), uint16(0), uint16(0), uint16(0),
      uint32(checksum), uint32(size), uint32(size), uint16(name.length), uint16(0), uint16(0),
      uint16(0), uint16(0), uint32(0), uint32(offset), name,
    ]));
    offset += localHeader.byteLength + size;
  }

  const central = concatBytes(centralDirectory);
  const end = concatBytes([
    uint32(0x06054b50), uint16(0), uint16(0), uint16(files.length), uint16(files.length),
    uint32(central.byteLength), uint32(offset), uint16(0),
  ]);
  const url = URL.createObjectURL(new Blob([concatBytes([...localParts, central, end])], { type: "application/zip" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
