import * as ProdServServices from "../services/prodServ.service";
import boom from "@hapi/boom";

//----------GET----------
//Controlador para obtener todos los productos/servicios
export const getProdServList = async (req, res, next) => {
  try {
    const prodServList = await ProdServServices.getProdServList();
    if (!prodServList) {
      throw boom.notFound("No se encontraron productos/servicios registrados.");
    } else if (prodServList) {
      res.status(200).json(prodServList);
    }
  } catch (error) {
    next(error);
  }
};

//Controlador para obtener un solo producto/servicio de en base a su ID
export const getProdServItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const keyType = req.query.keyType || "OK";
    const prodServItem = await ProdServServices.getProdServItem(id, keyType);
    if (!prodServItem) {
      throw boom.notFound("No se encontraron productos/servicios registrados.");
    } else if (prodServItem) {
      res.status(200).json(prodServItem);
    }
  } catch (error) {
    next(error);
  }
};
//----------FIN DE LOS CONTROLADORES PARA GET----------

//----------POST----------
//Controlador para añadir un producto
export const postProdServItem = async (req, res, next) => {
  try {
    //Guardar el documento del producto que se obtiene del body
    const paProdServItem = req.body;
    //Validar la entrada de datos antes de pasarla al servicio
    if (!paProdServItem || Object.keys(paProdServItem).length === 0) {
      throw boom.badRequest("Datos del producto son requeridos");
    }
    //Realizar la inserción del producto a la base de datos
    const newProdServItem = await ProdServServices.postProdServItem(
      paProdServItem
    );
    //Respuesta
    if (newProdServItem.success) {
      res.status(201).json(newProdServItem);
    } else {
      res.status(400).json(newProdServItem);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Controlador para añadir múltiples productos
export const postManyProdServItems = async (req, res, next) => {
  try {
    //Guardar el arreglo de documentos de los productos que se obtienen del body
    const prodServItems = req.body;
    //Validar la entrada de datos antes de pasarla al servicio
    if (!Array.isArray(prodServItems) || prodServItems.length === 0) {
      throw boom.badRequest(
        "Se requiere un arreglo con los datos de los productos"
      );
    }
    //Realizar la inserción de los productos a la base de datos
    const newProdServItems = await ProdServServices.postManyProdServItems(
      prodServItems
    );
    //Respuesta
    if (newProdServItems.success) {
      res.status(201).json(newProdServItems);
    } else {
      res.status(400).json(newProdServItems);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//----------POST SUBDOCUMENTOS----------
//Controlador para añadir un subdocumento a un producto, especificando en qué sección va el subdocumento (estatus||presentaciones||info_ad)
export const addSubdocumentProdServ = async (req, res, next) => {
  try {
    //Obtener id, sección y el subdocumento a añadir
    const { id, seccion } = req.params;
    const newSubDocument = req.body;

    //Llamar al servicio que añade subdocumentos pasándole los parámetros pertinentes
    const addedSubdocument = await ProdServServices.addSubdocumentProdServ(
      id,
      seccion,
      newSubDocument
    );

    //Manejo de errores
    if (!addedSubdocument.success) {
      if (addedSubdocument.message === "Producto no encontrado") {
        return res.status(404).json(addedSubdocument);
      }
      return res.status(400).json(addedSubdocument);
    }
    //Operación realizada con exito, devuelve subdocumento
    return res.status(200).json(addedSubdocument);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//----------FIN DE LOS CONTROLADORES PARA POST----------

//----------PUT-----------
//Controlador para modificar un producto
export const putProdServItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paProdServItem = req.body;
    const updatedProdServItem = await ProdServServices.putProdServItem(
      id,
      paProdServItem
    );

    if (!updatedProdServItem.success) {
      if (updatedProdServItem.message === "Producto no encontrado") {
        return res.status(404).json(updatedProdServItem);
      }
      return res.status(400).json(updatedProdServItem);
    }
    return res.status(200).json(updatedProdServItem);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Controlador para modificar los campos principales {IdProdServOK, IdProdServBK, CodigoBarras, DesProdServ, Indice} sin afectar los campos de subdocumentos {estatus, presentaciones, info_ad}
export const putPrimaryProdServ = async (req, res, next) => {
  const { id } = req.params; // ID del documento a actualizar
  const data = req.body; // Datos a actualizar

  try {
    const updatedPrimaryProdServ = await ProdServServices.putPrimaryProdServ(id, data);
    if (!updatedPrimaryProdServ) {
      throw boom.notFound('Producto no encontrado');
    }
    res.status(200).json({
      message: 'Producto modificado con éxito',
      data: updatedPrimaryProdServ,
    });
  } catch (error) {
    next(error);
  }
};


//----------PUT SUBDOCUMENTOS----------
//Controlador para modificar un subdocumento a un producto, especificando en qué sección va el subdocumento (estatus||presentaciones||info_ad) y su respectivo id
export const putProdServSubdocument = async (req, res, next) => {
  try {
    const { id, seccion, idSeccion } = req.params;
    const prodServSubdocument = req.body;
    const updatedProdServSubdocument =
      await ProdServServices.putProdServSubdocument(
        id,
        seccion,
        idSeccion,
        prodServSubdocument
      );
    if (!updatedProdServSubdocument.success) {
      if (updatedProdServSubdocument.message === "Producto no encontrado") {
        return res.status(404).json(updatedProdServSubdocument);
      }
      return res.status(400).json(updatedProdServSubdocument);
    }
    return res.status(200).json(updatedProdServSubdocument);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//----------FIN DE LOS CONTROLADORES PARA PUT----------

//----------DELETE----------
//Controlador para eliminar un producto
export const deleteProdServItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProdServItem = await ProdServServices.deleteProdServItem(id);

    if (deletedProdServItem.message === "Producto no encontrado") {
      return res.status(404).json(deletedProdServItem);
    }

    return res.status(200).json(deletedProdServItem);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//----------DELETE SUBDOCUMENTOS----------
export const deleteProdServSubdocument = async (req, res, next) => {
  try {
    const { id, seccion, idSeccion } = req.params;
    const deletedProdServSubdocument =
      await ProdServServices.deleteProdServSubdocument(id, seccion, idSeccion);

    if (!deletedProdServSubdocument.success) {
      if (deletedProdServSubdocument.message === "Producto no encontrado") {
        return res.status(404).json(deletedProdServSubdocument);
      }
      return res.status(400).json(deletedProdServSubdocument);
    }
    return res.status(200).json(deletedProdServSubdocument);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//----------FIN DE LOS CONTROLADORES PARA DELETE----------
