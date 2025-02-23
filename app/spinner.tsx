export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent
      ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'}`}
    />
  );