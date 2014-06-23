## HeaderController ##
### Overview ###
The HeaderController widget reads and displays application information, such as the title and logo. In addition, it reads widget pool configurations and displays the widget/group icon. When users click a specific icon in it, the corresponding widget/group opens or closes.

### Attributes ###
* `groupSetting`: Object[]; default: no default —The array of the groups setting. The groups come from the widget pool. Each setting has two properties:  `label` and `type`. The label should be the same as the group label in the widget pool. The type has two options: `dropDown` and `openAll`. If it’s dropDown, when users click the group icon, a drop-down menu appears. If it’s openAll, when users click the group icon, all widgets in the group open.
