import { useState, type MouseEvent } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  type SvgIconTypeMap,
} from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { MoreHoriz } from "@mui/icons-material";

export interface ActionItem {
  label: string;
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  onClick: () => void;
}

export default function ActionMenu({ actions }: { actions: ActionItem[] }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          height: 32,
          width: 32
        }}>
        <MoreHoriz />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1), 0px -3px 6px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              action.onClick();
            }}
          >
            {action.icon && (
              <ListItemIcon>
                <action.icon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
