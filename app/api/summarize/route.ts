// import { NextRequest, NextResponse } from "next/server";
// import { exec } from "child_process";
// import { writeFile } from "fs/promises";
// import * as path from "path";
// import { promisify } from "util";
// import { mkdir } from "fs/promises";

// const execPromise = promisify(exec);

// export async function POST(request: NextRequest) {
//   try {
//     // ensure uploads directory exists
//     const uploadsDir = path.join(process.cwd(), "uploads");
//     try {
//       await mkdir(uploadsDir, { recursive: true });
//     } catch (error) {
//       console.log("Error creating uploads directory: ", error);
//       return NextResponse.json(
//         { error: "Failed to create uploads directory" },
//         { status: 500 }
//       );
//     }

//     // parse form data
//     const formData = await request.formData();
//     const file = formData.get("document") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
//     }

//     //create a unique file name
//     const timestamp = Date.now();
//     const filename = `document_${timestamp}${path.extname(file.name)}`;
//     const filepath = path.join(uploadsDir, filename);

//     // convert file to buffer and save it
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     await writeFile(filepath, buffer);

//     // execute python script to summarize the document
//     const pythonScriptPath = path.join(
//       process.cwd(),
//       "backend",
//       "process_document.py"
//     );

//     const pythonCommand =
//       process.env.NODE_ENV === "production"
//         ? path.join(
//             process.cwd(),
//             "backend",
//             "venv",
//             process.platform === "win32" ? "Scripts" : "bin",
//             "python"
//           )
//         : "python";

//     console.log(
//       "About to execute python script: ",
//       pythonCommand,
//       pythonScriptPath,
//       filepath
//     );
//     // const { stdout, stderr } = await execPromise(
//     //   `python ${pythonScriptPath} "${filepath}"`
//     // );
//     const { stdout, stderr } = await execPromise(
//       `${pythonCommand} "${pythonScriptPath}" "${filepath}"`,
//       {
//         env: {
//           ...process.env,
//           OPENAI_API_KEY: process.env.OPENAI_API_KEY,
//         },
//       }
//     );

//     console.log("Python execution complete");
//     console.log("stdout: ", stdout);

//     if (stderr) {
//       console.error("python script stderror:", stderr);
//       return NextResponse.json(
//         { error: "Error processing document." },
//         { status: 500 }
//       );
//     }

//     let summary;
//     try {
//       summary = JSON.parse(stdout).summary;
//     } catch (error) {
//       console.error("Error parsing python script output: ", error);
//       return NextResponse.json(
//         {
//           error: "Error parsing summary",
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ summary });
//   } catch (error) {
//     console.error("Error handling file upload: ", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFile } from "fs/promises";
import * as path from "path";
import { promisify } from "util";
import { mkdir } from "fs/promises";

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log("Error creating uploads directory: ", error);
      return NextResponse.json(
        { error: "Failed to create uploads directory" },
        { status: 500 }
      );
    }

    // parse form data
    const formData = await request.formData();
    const file = formData.get("document") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Validate file type
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".md",
      ".csv",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".ogg",
    ];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${fileExtension}. Supported types: ${allowedExtensions.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Check file size (25MB limit for audio files due to OpenAI Whisper API limits)
    const maxSize = fileExtension.match(/\.(mp3|wav|m4a|aac|ogg)$/)
      ? 25 * 1024 * 1024
      : 50 * 1024 * 1024; // 25MB for audio, 50MB for documents

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        {
          error: `File too large. Maximum size for ${fileExtension} files is ${maxSizeMB}MB.`,
        },
        { status: 400 }
      );
    }

    //create a unique file name
    const timestamp = Date.now();
    const filename = `document_${timestamp}${path.extname(file.name)}`;
    const filepath = path.join(uploadsDir, filename);

    // convert file to buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // execute python script to summarize the document
    const pythonScriptPath = path.join(
      process.cwd(),
      "backend",
      "process_document.py"
    );

    const pythonCommand =
      process.env.NODE_ENV === "production"
        ? path.join(
            process.cwd(),
            "backend",
            "venv",
            process.platform === "win32" ? "Scripts" : "bin",
            "python"
          )
        : "python";

    console.log(
      "About to execute python script: ",
      pythonCommand,
      pythonScriptPath,
      filepath
    );

    const { stdout, stderr } = await execPromise(
      `${pythonCommand} "${pythonScriptPath}" "${filepath}"`,
      {
        env: {
          ...process.env,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        },
        timeout: 300000, // 5 minutes timeout for audio processing
      }
    );

    console.log("Python execution complete");
    console.log("stdout: ", stdout);

    if (stderr) {
      console.error("python script stderror:", stderr);
      return NextResponse.json(
        { error: "Error processing document." },
        { status: 500 }
      );
    }

    let summary;
    try {
      summary = JSON.parse(stdout).summary;
    } catch (error) {
      console.error("Error parsing python script output: ", error);
      return NextResponse.json(
        {
          error: "Error parsing summary",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error handling file upload: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
