import { Download } from "lucide-react";

interface DownloadButtonProps {
  fileName: string | null;
}

export default function DownloadButton({ fileName }: DownloadButtonProps) {
  if (!fileName) return null;

  return (
    <div className="pt-2">
      <a
        href={`https://noit.eu/${fileName}`}
        download
        className="inline-flex items-center gap-3 rounded-md bg-[#32ab56] px-5 py-3 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-[#2c984c] hover:shadow-lg focus:ring-2 focus:ring-[#2c984c]/50 focus:outline-none active:translate-y-[1px] active:shadow-sm"
      >
        <Download className="h-5 w-5" strokeWidth={2} />
        <span className="font-semibold tracking-wide">Свалете приложението</span>
      </a>
    </div>
  );
}
