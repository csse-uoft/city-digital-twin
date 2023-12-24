import { Input as JoyInput } from "@mui/joy";
import { FormControl as JoyFormControl, FormLabel as JoyFormLabel, FormHelperText as JoyFormHelperText} from '@mui/joy';

export function NumberInput({label, desc, disabled, onChange, value, id}) {
  return (
    <JoyFormControl>
      <JoyFormLabel>{label}</JoyFormLabel>
      <JoyInput
        id={id}
        type="number"
        disabled={disabled} 
        placeholder={label}
        value={value}
        onChange={onChange}
        sx={{ maxWidth: '130px', marginRight: '10px' }}
      />
      <JoyFormHelperText>{desc}</JoyFormHelperText>
    </JoyFormControl>
  );
}