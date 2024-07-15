import { Autocomplete as JoyAutocomplete, AutocompleteOption as JoyAutocompleteOption, ListItemContent as JoyListItemContent, Checkbox as JoyCheckbox, ListItemDecorator as JoyListItemDecorator, Chip as JoyChip, FormControl as JoyFormControl, FormLabel as JoyFormLabel, FormHelperText as JoyFormHelperText} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect } from 'react';

export function NewDropdownMultiSelect({label, options, desc, disabled, onChange, id, currentlySelected}) {
  return (
    <JoyFormControl>
      <JoyFormLabel>{label}</JoyFormLabel>
      <JoyAutocomplete
        id={id}
        disableCloseOnSelect
        multiple
        disabled={disabled} 
        placeholder={label}
        options={options}
        onChange={onChange}
        value={currentlySelected}
        isOptionEqualToValue={(option, value) => option === value}

        sx={{ maxWidth: 300, minWidth: 220 }}
        renderTags={(tags, getTagProps) =>
          tags.map((item, index) => (
            <JoyChip
              variant="solid"
              color="primary"
              endDecorator={<CloseIcon fontSize="sm" />}
              sx={{ minWidth: 0 }}
              {...getTagProps({ index })}
            >
              {item}
            </JoyChip>
          ))
        }
      />
      <JoyFormHelperText>{desc}</JoyFormHelperText>
    </JoyFormControl>
  );
}