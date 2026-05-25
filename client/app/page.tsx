import FileUpload from "./component/file-upload";
import Chat from "./component/Chat";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    // Add 'flex' and 'flex-1' or 'h-full'
    <div className="h-full w-full">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex w-[96%] ml-[2%] h-[95%]">
        {/* Left */}
        <div className="flex justify-center items-center w-[30%] h-[90%]">
          <FileUpload />
        </div>

        {/* Right */}
        <div className="w-[70%] border-l-2 border-gray-700">
          <Chat />
        </div>
      </div>
    </div>
  );
}
