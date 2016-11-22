# Filters

Esta carpeta contiene los script que hacen el post-procesamiento de los datos que se extraen de los Darwin-Core. Por ejemplo, en estos filtros
se deben implementar todos aquellos cambios en los tipos de variables, que no se encuentran contemplados en los mappers.

Un ejemplo importante de post-procesamiento, que realizamos en este nivel es la definición de los grupos de acceso a los datos dependiendo en 
el campo IntellectualRights del *eml.xml*, que es mapeado en el campo *intellectual_rights* por el mapper del recurso. El grupo del recurso se
define de la siguiente manera: 

  * **super**: Todos los recursos de que se importan en el API, pertenecen a este grupo por defecto.
  * **humbodt**: Pertenecen a este grupo todos los recursos que sean del tipo: *__"Libre a nivel interno y Libre a nivel interno y externo (Creative Commons Attribution Non Commercial (CC-BY-NC) 4.0)"__*
  * **guess**: Solo los recursos que son del tipo: *__“Libre a nivel interno y externo (Creative Commons Attribution Non Commercial (CC-BY-NC) 4.0)”__* pertenecen a este grupo.
