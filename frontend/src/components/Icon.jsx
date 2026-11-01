const rawSvgs = import.meta.glob('../../assets/svg/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const iconsByName = Object.entries(rawSvgs).reduce((acc, [filePath, svgContent]) => {
  const fileName = filePath.split('/').pop()?.replace('.svg', '');
  if (fileName && typeof svgContent === 'string') {
    acc[fileName] = svgContent.replace(
      '<svg ',
      '<svg fill="currentColor" width="100%" height="100%" aria-hidden="true" '
    );
  }
  return acc;
}, {});

export default function Icon({ name, className = 'w-5 h-5', title }) {
  const markup = iconsByName[name];
  if (!markup) return null;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      title={title}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

