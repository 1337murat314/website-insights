import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
  dialCode: string;
}

const countryCodes: CountryCode[] = [
  { code: "TR", country: "Turkey", flag: "🇹🇷", dialCode: "+90" },
  { code: "US", country: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "GB", country: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "DE", country: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "FR", country: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "IT", country: "Italy", flag: "🇮🇹", dialCode: "+39" },
  { code: "ES", country: "Spain", flag: "🇪🇸", dialCode: "+34" },
  { code: "NL", country: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
  { code: "BE", country: "Belgium", flag: "🇧🇪", dialCode: "+32" },
  { code: "AT", country: "Austria", flag: "🇦🇹", dialCode: "+43" },
  { code: "CH", country: "Switzerland", flag: "🇨🇭", dialCode: "+41" },
  { code: "SE", country: "Sweden", flag: "🇸🇪", dialCode: "+46" },
  { code: "NO", country: "Norway", flag: "🇳🇴", dialCode: "+47" },
  { code: "DK", country: "Denmark", flag: "🇩🇰", dialCode: "+45" },
  { code: "FI", country: "Finland", flag: "🇫🇮", dialCode: "+358" },
  { code: "PL", country: "Poland", flag: "🇵🇱", dialCode: "+48" },
  { code: "CZ", country: "Czech Republic", flag: "🇨🇿", dialCode: "+420" },
  { code: "GR", country: "Greece", flag: "🇬🇷", dialCode: "+30" },
  { code: "PT", country: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "RU", country: "Russia", flag: "🇷🇺", dialCode: "+7" },
  { code: "UA", country: "Ukraine", flag: "🇺🇦", dialCode: "+380" },
  { code: "AE", country: "UAE", flag: "🇦🇪", dialCode: "+971" },
  { code: "SA", country: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "IL", country: "Israel", flag: "🇮🇱", dialCode: "+972" },
  { code: "EG", country: "Egypt", flag: "🇪🇬", dialCode: "+20" },
  { code: "IN", country: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "CN", country: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "JP", country: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "KR", country: "South Korea", flag: "🇰🇷", dialCode: "+82" },
  { code: "AU", country: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "NZ", country: "New Zealand", flag: "🇳🇿", dialCode: "+64" },
  { code: "CA", country: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "MX", country: "Mexico", flag: "🇲🇽", dialCode: "+52" },
  { code: "BR", country: "Brazil", flag: "🇧🇷", dialCode: "+55" },
  { code: "AR", country: "Argentina", flag: "🇦🇷", dialCode: "+54" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(
    countryCodes[0] // Default to Turkey
  );

  // Extract country code and number from value if present
  React.useEffect(() => {
    if (value) {
      const matchedCountry = countryCodes.find((c) =>
        value.startsWith(c.dialCode)
      );
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
      }
    }
  }, []);

  const handleCountryChange = (code: string) => {
    const country = countryCodes.find((c) => c.code === code);
    if (country) {
      setSelectedCountry(country);
      // Extract just the number part and prepend new dial code
      const numberPart = value.replace(/^\+\d+\s?/, "");
      onChange(`${country.dialCode} ${numberPart}`);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only keep numbers and spaces
    const cleaned = inputValue.replace(/[^\\d\\s]/g, "");
    onChange(`${selectedCountry.dialCode} ${cleaned}`);
  };

  // Get just the number part without the dial code
  const getNumberPart = () => {
    return value.replace(selectedCountry.dialCode, "").trim();
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[120px] flex-shrink-0">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-background z-50">
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium">{country.dialCode}</span>
                <span className="text-sm text-muted-foreground truncate">
                  {country.country}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={getNumberPart()}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
}
