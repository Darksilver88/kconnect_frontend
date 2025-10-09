import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'ค้นหา...',
  className = '',
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pl-10 pr-20 h-11 bg-white"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-14 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <Button
        onClick={onSearch}
        size="sm"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 bg-blue-600 hover:bg-blue-700"
      >
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
}
