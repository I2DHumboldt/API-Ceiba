## Mappers

La idea de los mappers es poder definir en un JSON, los campos de origen y destino de una función de transformación.

### Cómo definir un mapper

La mejor forma de explicar la estructura de los mappers y cómo se definen es con un ejemplo. Supongamos que tenemos el
objecto persona

```js
    persona = {
        info: {nombre: "Juan", apellido: "Perez", x: 10, y: 20},
        familia: { numero_de_hijos: 10},
        edad: 23
        mascotas_anteriores: [{nombre: "gato"}, {nombre:"perro"}, {nombre:"canario"}]
        mascota_actual: {tipo: "tortuga"}
    }
```

Y que queremos transformalo en un objecto con la siguiente estructura:


```js
    person = {name: "Juan", age: 23, location: {lat: 10, lon: 20}, pets: ["gato", "perro", "canario", "tortuga"]}
    
```

El mapper en este caso debe ser el siguiente:

``` js
     {
         'info': {
                'nombre': 'name',
                'x': 'location.lat',
                'y': 'location.lon'
         },
         'edad': 'age',
         'mascotas_anteriores': {
            'nombre': 'pets'
         },
         'mascota_actual': {
            'tipo': 'pets'
         }
     }
```

### Explicación

Como se puede observar el mapper es un JSON, cuyas llaves (keys) corresponden a las llaves del objecto de entrada.
los valores (value) del mapper que son de tipo 'string' corresponden a los campos en el objecto de salida. Para especificar
mas de un nivel en el campo, como por ejemplo x e y que se mapean en location.lat y location.lon, se deben separar con puntos
cada uno de los niveles `x: 'location.lat'`

Si el campo que se quiere mapear es un objecto, el mapeo se realiza sobre cada uno de los elementos del arreglo y el resultado
se apila sobre la variables de salida, como en el caso de las mascotas_anteriores.
También es posible mapear múltiples campos del objecto de entrada sobre un mismo campo del objeto de salida, como en el caso
de mascotas_anteriores.nombre y mascota_actual.tipo. En esos casos el resultado también se apila sobre los resultados
previos.