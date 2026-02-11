"use client";

interface ButtonFileProps extends Pick<React.ComponentPropsWithoutRef<'input'>, 'accept'> {
  loading?: boolean
  onChange: (files: File[]) => void
}

export default function ButtonFile(props: ButtonFileProps) {
  const { onChange, accept } = props
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const input = evt.currentTarget;
    if (!input.files?.length) return;
    onChange?.(Array.from(input.files ?? []))
  };

  return (
    <>
      <label htmlFor="file-upload">
        <div className="px-6 py-3 rounded-xl bg-indigo-500 text-white cursor-pointer">
          Selecionar PDF
        </div>
      </label>
      <input
        id="file-upload"
        onChange={handleChange}
        type="file"
        accept={accept}
        className="hidden"
      />
    </>
  );
}
