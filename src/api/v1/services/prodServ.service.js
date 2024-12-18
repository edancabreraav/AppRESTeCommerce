import ProdServ from "../models/ProdServ";
import boom from "@hapi/boom";
import { OK, FAIL } from "../../../middlewares/resp.handler";

//----------GET----------
//Método para obtener la lista completa de productos/servicios
export const getProdServList = async () => {
  let prodServList;
  try {
    prodServList = await ProdServ.find();
    return prodServList;
  } catch (error) {
    throw boom.internal(error);
  }
};

//Método para obtener un solo producto/servicio de en base a su ID
export const getProdServItem = async (id, keyType) => {
  let prodServItem;
  try {
    if (keyType === "OK") {
      prodServItem = await ProdServ.findOne({
        IdProdServOK: id,
      });
    } else if (keyType === "BK") {
      prodServItem = await ProdServ.findOne({
        IdProdServBK: id,
      });
    }
    return prodServItem;
  } catch (error) {
    throw boom.internal(error);
  }
};

//----------POST----------
//Método para añadir un producto
export const postProdServItem = async (paProdServItem) => {
  try {
    const newProdServItem = await new ProdServ(paProdServItem).save();
    return OK("Producto añadido exitosamente", newProdServItem);
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("El producto ya existe", error);
    } else {
      return FAIL("No se pudo agregar el proudcto, error en el servidor",error);
    }
  }
};

//Método para añadir múltiples productos
export const postManyProdServItems = async (ProdServItems) => {
  try {
    const newProdServItems = await ProdServ.insertMany(ProdServItems);
    return OK("Productos añadidos exitosamente", newProdServItems);
  } catch (error) {
    return FAIL(
      "No se pudieron agregar los proudctos, error en el servidor",
      error
    );
  }
};

//----------POST SUBDOCUMENTOS----------
//Método para añadir un subdocumento a un producto, especificando en qué sección va el subdocumento (estatus||presentaciones||info_ad)
export const addSubdocumentProdServ = async (id, seccion, newSubDocument) => {
  const allowedSections = ["estatus", "presentaciones", "info_ad"];
  if (!allowedSections.includes(seccion)) {
    return FAIL("Sección inválida");
  }

  try {

    //Primero verficamos que el subodc que intentamos añadir no exista ya en la bd
    const uniqueField = {
      estatus: "IdTipoEstatusOK",
      presentaciones: "IdPresentaOK",
      info_ad: "IdEtiquetaOK"
    };
    const uniqueKey = uniqueField[seccion];
    // Verificar si ya existe un subdocumento con el mismo identificador
    const existingProdServ = await ProdServ.findOne({
      IdProdServOK: id,
      [`${seccion}.${uniqueKey}`]: newSubDocument[uniqueKey]
    });
    if (existingProdServ) {
      return FAIL("id duplicado, no se realizó la inserción");
    }
    //---Fin de la verificación de id duplicada----

    //Si la sección es estatus cambia el cambio ACTUAL a 'N'
    if ( seccion === "estatus"){

      let arrayFilters = [
        { "estatus.Actual": { $eq: 'S' } } 
      ]
      const campo = 'estatus.$[estatus].Actual';

      const cambiarActual = await ProdServ.findOneAndUpdate(
        { IdProdServOK: id }, // Busqueda por el IdProdServOK
        { $set: { [campo]: 'N' } }, 
        { 
          arrayFilters,
          new: true 
        } 
      );
    }

    // $push para añadir el nuevo subdocumento al arreglo
    const updatedProdServ = await ProdServ.findOneAndUpdate(
      { IdProdServOK: id }, // Busqueda por el IdProdServOK
      { $push: { [seccion]: newSubDocument } }, //Agregación del subdocumento en la sección correspondiente
      { new: true } // Devuelve el documento actualizado
    );

    // Error si no se encuentra el producto
    if (!updatedProdServ) {
      return FAIL("Producto no encontrado");
    }
    return OK("Subdocumento agregado con éxito", updatedProdServ);
  } catch (error) {
      console.error(error);
      return FAIL("Error al agregar subdocumento", error);
  }
};

//Método para añadir un subdocumento (estatus[], info_vta[], archivos[]) dentro de un subdocumento presentaciones
export const addPresentacionSubdocument = async (id, idPresentacion, seccionPresentacion, newPresentacionSubdocument) => {
  const allowedSections = ['estatus', 'info_vta', 'archivos'];
  if (!allowedSections.includes(seccionPresentacion)) {
    return FAIL('Sección de presentación inválida');
  }

  // Define la consulta para ubicar la presentación
  const query = {
    IdProdServOK: id,
    "presentaciones.IdPresentaOK": idPresentacion
  };

  //Cambiar todos los estatus.Actual a N
  if (seccionPresentacion === "estatus" && newPresentacionSubdocument.Actual === "S"){
    let arrayFilters = [
      { "presentacion.IdPresentaOK": idPresentacion }, 
      { "subdocument.Actual": { $eq: 'S' } } 
    ]
    try {
      
      const campoActual = `presentaciones.$[presentacion].${seccionPresentacion}.$[subdocument].Actual`;
      const updatedActual = await ProdServ.findOneAndUpdate(
        query,
        { $set: { [campoActual]: 'N' } },
        {
          arrayFilters,
          new: true,
        }
      );

    } catch (error) {
        console.error(error);
        return FAIL("Error al modificar el campo ACTUAL", error);
    }

  }

  // Define el path de la sección a actualizar
  const pathToAdd = `presentaciones.$.${seccionPresentacion}`;

  try {
    const addedDocument = await ProdServ.findOneAndUpdate(
      query,
      { $push: { [pathToAdd]: newPresentacionSubdocument } },
      { new: true }
    );

    return OK("Subdocumento añadido con éxito", addedDocument);
  } catch (error) {
    if (error.code === 11000) {
      return FAIL ('Clave duplicada', error);
    } else {
      console.error(error);
      return FAIL("Error al añadir el subdocumento", error);
    }
  }
};

//----------PUT----------
//Método para modificar un producto
export const putProdServItem = async (id, paProdServItem) => {
  try {
    //Modificación del producto en base a su id
    const updatedProdServItem = await ProdServ.findOneAndUpdate(
      {
        IdProdServOK: id,
      },
      paProdServItem,
      { new: true }
    );
    //Validación sino se encuentra el producto
    if (!updatedProdServItem) {
      return FAIL("Producto no encontrado");
    }
    //Mensaje de éxito
    console.log(updatedProdServItem);
    return OK("Producto modificado con éxito", updatedProdServItem);
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("Clave repetida, no se pudo modificar el producto", error);
    } else {
      if (error.code == 11000) {
        return FAIL("El producto ya existe", error);
      } else {
        return FAIL("No se pudo modificar el proudcto, error en el servidor",error);
      }
    }
  }
};

//Método para modificar los campos principales {IdProdServOK, IdProdServBK, CodigoBarras, DesProdServ, Indice} sin afectar los campos de subdocumentos {estatus, presentaciones, info_ad}
export const putPrimaryProdServ = async (id, data) => {
  try {
    const updatedPrimaryProdServ = await ProdServ.findOneAndUpdate(
      {IdProdServOK: id,}, 
      {$set: data,}, // Solo actualiza los campos especificados 
      {new: true});
    return OK("Producto modificado con éxito", updatedPrimaryProdServ);
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("Clave repetida, no se puede modificar el producto", error);
    } else {
      return FAIL("No se pudo agregar el proudcto, error en el servidor",error);
    }
  }
};

//----------PUT SUBDOCUMENTOS----------
//Método para modificar un subdocumento
export const putProdServSubdocument = async ( id, seccion, idSeccion, updatedSubdocument) => {
  const allowedSections = ["estatus", "presentaciones", "info_ad"];
  if (!allowedSections.includes(seccion)) {
    return FAIL("Sección inválida");
  }
  let query = {};
  if (seccion === "estatus") {
    query = { IdProdServOK: id, "estatus.IdTipoEstatusOK": idSeccion };
  } else if (seccion === "presentaciones") {
    query = { IdProdServOK: id, "presentaciones.IdPresentaOK": idSeccion };
  } else {
    query = { IdProdServOK: id, "info_ad.IdEtiquetaOK": idSeccion };
  }

  try {

    //Si la sección es estatus cambia el cambio ACTUAL a 'N'
    if ( seccion === "estatus" && updatedSubdocument.Actual === "S"){

      let arrayFilters = [
        { "estatus.Actual": { $eq: 'S' } } 
      ]
      const campo = 'estatus.$[estatus].Actual';

      const cambiarActual = await ProdServ.findOneAndUpdate(
        { IdProdServOK: id }, // Busqueda por el IdProdServOK
        { $set: { [campo]: 'N' } }, 
        { 
          arrayFilters,
          new: true 
        } 
      );
    }

    const updatedSectionProdServ = await ProdServ.findOneAndUpdate(
      query,
      { $set: { [`${seccion}.$`]: updatedSubdocument } },
      { new: true }
    );

    if (!updatedSectionProdServ) {
      return FAIL("Producto o subdocumento no encontrado");
    }

    return OK("Subdocumento modificado con éxito", updatedSectionProdServ);
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("Clave repetida, no se puede modificar el subdocumento", error);
    } else {
      return FAIL("Error al modificar el subdocumento",error);
    }
  }
};

//Método para modificar el subdocumento PRESENTACIONES sin afectar sus subdocumentos internos {estatus[], info_vta[], archivos[]}
export const putPrimaryPresentacion = async (id, idPresentacion, data) => {
  try {
    const updatedPresentacion = await ProdServ.findOneAndUpdate ({IdProdServOK: id, 'presentaciones.IdPresentaOK': idPresentacion},{
      $set: {
        "presentaciones.$.IdPresentaOK": data.IdPresentaOK,
        "presentaciones.$.IdPresentaBK": data.IdPresentaBK,
        "presentaciones.$.CodigoBarras": data.CodigoBarras,
        "presentaciones.$.DesPresenta": data.DesPresenta,
        "presentaciones.$.Indice": data.Indice,
        "presentaciones.$.Principal": data.Principal,
        
      },
    }, {new: true});
    return OK("Presentación actualizada con éxito", updatedPresentacion)
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("Clave duplicada, no se pudo actualizar la presentación", error);
    } else {
      console.log(error)
      return FAIL("No se pudo actualizar la presentación", error)
    }
  }
}

//Método para modificar un subdocumento (estatus[], info_vta[], archivos[]) que se encuentre dentro de un subdocumento presentaciones
export const putPresentacionSubdocument = async (id, idPresentacion, seccionPresentacion, idSeccionPresentacion, data) => {
  const allowedSections = ['estatus', 'info_vta', 'archivos'];
  if (!allowedSections.includes(seccionPresentacion)) {
    return FAIL('Sección de presentación inválida');
  }

  // Define la consulta para ubicar la presentación
  const query = {
    IdProdServOK: id,
    "presentaciones.IdPresentaOK": idPresentacion
  };

  //Cambiar todos los estatus.Actual a N
  if (seccionPresentacion === "estatus" && data.Actual === "S"){
    let arrayFilters = [
      { "presentacion.IdPresentaOK": idPresentacion }, 
      { "subdocument.Actual": { $eq: 'S' } } 
    ]
    try {
      
      const campoActual = `presentaciones.$[presentacion].${seccionPresentacion}.$[subdocument].Actual`;
      const updatedActual = await ProdServ.findOneAndUpdate(
        query,
        { $set: { [campoActual]: 'N' } },
        {
          arrayFilters,
          new: true,
        }
      );

    } catch (error) {
        console.error(error);
        return FAIL("Error al modificar el campo ACTUAL", error);
    }

  }

  // Define el path para la sección específica dentro de `presentaciones`
  const pathToUpdate = `presentaciones.$[presentacion].${seccionPresentacion}.$[subdocument]`;

  let arrayFilters = []

  if (seccionPresentacion === 'estatus') {
    // Configura los filtros de los arrays
    arrayFilters = [
      { "presentacion.IdPresentaOK": idPresentacion },
      { [`subdocument.IdTipoEstatusOK`]: idSeccionPresentacion }
    ];
  } else if (seccionPresentacion === 'info_vta'){
    arrayFilters = [
      { "presentacion.IdPresentaOK": idPresentacion },
      { [`subdocument.IdEtiquetaOK`]: idSeccionPresentacion }
    ];
  }else
  arrayFilters = [
    { "presentacion.IdPresentaOK": idPresentacion },
    { [`subdocument.IdArchivoOK`]: idSeccionPresentacion }
  ];

  try {
    const updatedSeccion = await ProdServ.findOneAndUpdate(
      query,
      { $set: { [pathToUpdate]: data } },
      {
        arrayFilters,
        new: true,
      }
    );

    if (!updatedSeccion) {
      return FAIL("Producto o subdocumento no encontrado");
    }

    return OK("Subdocumento modificado con éxito", updatedSeccion);
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("Clave duplicada, no se pudo actualizar el subdocumento", error);
    } else {
      console.error(error);
      return FAIL("Error al modificar el subdocumento", error);
    }     
  }
};

//----------DELETE-----------
//Método para eliminar un producto
export const deleteProdServItem = async (id) => {
  const deletedProdServItem = await ProdServ.deleteOne({ IdProdServOK: id });

  if (deletedProdServItem.deletedCount === 0) {
    return FAIL("Producto no encontrado");
  }
  //Mensaje de éxito
  console.log(deletedProdServItem);
  return OK("Producto eliminado", deletedProdServItem);
};
//----------DELETE SUBDOCUMENTOS----------
//Método para eliminar un subdocumento
export const deleteProdServSubdocument = async (id, seccion, idSeccion) => {
  const allowedSections = ["estatus", "presentaciones", "info_ad"];
  if (!allowedSections.includes(seccion)) {
    return FAIL("Sección inválida");
  }
  let query = {};
  if (seccion === "estatus") {
    query = { $pull: { estatus: { IdTipoEstatusOK: idSeccion } } };
  } else if (seccion === "presentaciones") {
    query = { $pull: { presentaciones: { IdPresentaOK: idSeccion } } };
  } else {
    query = { $pull: { info_ad: { IdEtiquetaOK: idSeccion } } };
  }
  try {
    const deletedSectionProdServ = await ProdServ.findOneAndUpdate(
      { IdProdServOK: id },
      query,
      { new: true }
    );

    if (!deletedSectionProdServ) {
      return FAIL("Producto o subdocumento no encontrado");
    }

    return OK("Subdocumento eliminado con éxito", deletedSectionProdServ);
  } catch (error) {
    console.error(error);
    return FAIL("Error al eliminar el subdocumento", error);
  }
};

// Método para eliminar un subdocumento (estatus[], info_vta[], archivos[]) dentro de un subdocumento presentaciones
export const deletePresentacionSubdocument = async (id, idPresentacion, seccionPresentacion, idSubdocument) => {
  const allowedSections = ['estatus', 'info_vta', 'archivos'];
  if (!allowedSections.includes(seccionPresentacion)) {
    return FAIL('Sección de presentación inválida');
  }

  // Define la consulta para ubicar la presentación
  const query = {
    IdProdServOK: id,
    "presentaciones.IdPresentaOK": idPresentacion
  };
  // Define el path de la sección en donde se encuentra el subdocumento a eliminar
  const pathToUpdate = `presentaciones.$.${seccionPresentacion}`;

  // Construir el filtro para el subdocumento que queremos eliminar
  let subdocument = {}
  if (seccionPresentacion === 'estatus') {
    subdocument = { [`${pathToUpdate}`]: { IdTipoEstatusOK: idSubdocument } };
  } else if (seccionPresentacion === 'info_vta') {
    subdocument = { [`${pathToUpdate}`]: { IdEtiquetaOK: idSubdocument } };
  } else {
    subdocument = { [`${pathToUpdate}`]: { IdArchivoOK: idSubdocument } };
  }

  try {
    const updatedDocument = await ProdServ.findOneAndUpdate(
      query,
      { $pull: subdocument },
      { new: true }
    );

    if (!updatedDocument) {
      return FAIL("Producto, presentación o subdocumento no encontrado");
    }

    return OK("Subdocumento eliminado con éxito", updatedDocument);
  } catch (error) {
    console.error(error);
    return FAIL("Error al eliminar el subdocumento", error);
  }
};

