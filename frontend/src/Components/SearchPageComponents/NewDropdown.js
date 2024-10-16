import { Autocomplete as JoyAutocomplete, FormControl as JoyFormControl, FormLabel as JoyFormLabel, FormHelperText as JoyFormHelperText} from '@mui/joy';
import { CircularProgress as JoyCircularProgress }from "@mui/joy";

export function NewDropdown({label, options, desc, disabled, onChange, id, isLoading=false, value=null}) {
  return (
    <JoyFormControl>
      <JoyFormLabel>{label}</JoyFormLabel>
      <JoyAutocomplete
        id={id}
        disabled={disabled} 
        placeholder={label}
        value={value}
        options={options}
        onChange={onChange}
        loading={isLoading}
        sx={{ maxWidth: 270, minWidth: 220 }}
        endDecorator={
          isLoading ? (
            <JoyCircularProgress size="sm" sx={{ bgcolor: 'background.surface'}} />
          ) : null
          // <JoyCircularProgress size="sm" sx={{ bgcolor: 'background.surface'}} />
        }
      />
      <JoyFormHelperText>{desc}</JoyFormHelperText>
    </JoyFormControl>
  );
}

export function NewDropdownStateValue({label, options, desc, disabled, onChange, id, isLoading=false, value}) {
  return (
    <JoyFormControl>
      <JoyFormLabel>{label}</JoyFormLabel>
      <JoyAutocomplete
        id={id}
        disabled={disabled}
        disableClearable 
        placeholder={label}
        options={options}
        onChange={onChange}
        loading={isLoading}
        value={value}
        sx={{ maxWidth: 200 }}
        endDecorator={
          isLoading ? (
            <JoyCircularProgress size="sm" sx={{ bgcolor: 'background.surface'}} />
          ) : null
          // <JoyCircularProgress size="sm" sx={{ bgcolor: 'background.surface'}} />
        }
      />
      <JoyFormHelperText>{desc}</JoyFormHelperText>
    </JoyFormControl>
  );
}