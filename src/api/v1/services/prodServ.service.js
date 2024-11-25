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
    const newProdServItem = new ProdServ(paProdServItem).save();
    return OK("Producto añadido exitosamente", newProdServItem);
  } catch (error) {
    if (error.code == 11000) {
      return FAIL("El producto ya existe", error);
    } else {
      return FAIL(
        "No se pudo agregar el proudcto, error en el servidor",
        error
      );
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
    return FAIL("No se pudo modificar el producto", error);
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
    return FAIL("No se pudo modificar el producto", error);
  }
};

//----------PUT SUBDOCUMENTOS----------
//Método para modificar un subdocumento
export const putProdServSubdocument = async (
  id,
  seccion,
  idSeccion,
  updatedSubdocument
) => {
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
    console.error(error);
    return FAIL("Error al modificar el subdocumento", error);
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
