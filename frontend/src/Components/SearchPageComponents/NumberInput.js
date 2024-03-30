import { Input as JoyInput } from "@mui/joy";
import { FormControl as JoyFormControl, FormLabel as JoyFormLabel, FormHelperText as JoyFormHelperText} from '@mui/joy';

/*
 * This function implements a slightly customized JoyUI Input component for inputting numerical values (such as years).
 * Documentation for the underlying JoyUI component is here: https://mui.com/joy-ui/react-input/.
 * 
 * PARAMETERS:
 *  - label: The text going above the input box, acting as a 'title' for it.
 *  - desc: The text going below the input box, acting as a short description for it.
 *  - disabled: Whether or not you can input anything into the box.
 *  - onChange: What should happen when something new is inputted
 *  - value: Current selected value of the 
 */
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