import { Autocomplete as JoyAutocomplete, FormControl as JoyFormControl, FormLabel as JoyFormLabel, FormHelperText as JoyFormHelperText} from '@mui/joy';

export function NewDropdown({label, options, desc, disabled, onChange, id}) {
  return (
    <JoyFormControl>
      <JoyFormLabel>{label}</JoyFormLabel>
      <JoyAutocomplete
        id={id}
        disabled={disabled} 
        placeholder={label}
        options={options}
        onChange={onChange}
        sx={{ maxWidth: 270, minWidth: 220 }}
      />
      <JoyFormHelperText>{desc}</JoyFormHelperText>
    </JoyFormControl>
  );
}