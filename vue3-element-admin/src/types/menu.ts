export interface MenuSearchResultDto {
  id: string;
  parentId?: string;
  menuNamePinyin:string;
  menuNameInitials:string;
  menuName: string;
  path: string;
  component?: string;
  icon?: string;
  permissionCode?: string;
  isVisible: boolean;
  sort: number;
  parentMenuName?: string;
  menuPath?: string;
  score?: number;
  highlightedMenuName?: string;
}