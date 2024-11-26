import { Router } from "express";
import * as prodServController from "../controllers/prodServ.controller";

const router = Router();

//----------GET----------
//Ruta para obtener la lista de todos los productos
router.get("/", prodServController.getProdServList);
//Ruta para obtener un solo producto en base a su ID
router.get("/:id", prodServController.getProdServItem);

//----------POST----------
//Ruta para añadir un producto
router.post("/", prodServController.postProdServItem);
//Ruta para múltiples productos
router.post("/addMany", prodServController.postManyProdServItems);
//SUBDOCUMENTOS
//Ruta para añadir un subdocumento a una sección de producto
router.post("/:id/:seccion", prodServController.addSubdocumentProdServ);
//Ruta para añadir un subdocumento (estatus[], info_vta[], archivos[]) dentro de un subdocumento presentaciones
router.post('/presentaciones/subdocs/:id/:idPresentacion/:seccionPresentacion', prodServController.addPresentacionSubdocument);


//----------PUT----------
//Ruta para modificar un producto
router.put("/:id", prodServController.putProdServItem);

//Ruta para modificar los campos principales {IdProdServOK, IdProdServBK, CodigoBarras, DesProdServ, Indice} sin afectar los campos de subdocumentos {estatus, presentaciones, info_ad}
router.put('/update/:id', prodServController.putPrimaryProdServ)

//SUBDOCUMENTOS
//Ruta para modificar un subdocumento a una sección de producto
router.put(
  "/:id/:seccion/:idSeccion",
  prodServController.putProdServSubdocument
);

//Ruta para modificar el subdocumento PRESENTACIONES sin afectar sus subdocumentos internos {estatus[], info_vta[], archivos[]}
router.put('/presentaciones/primary/:id/:idPresentacion', prodServController.putPrimaryPresentacion);

//Ruta para modificar un subdocumento (estatus[], info_vta[], archivos[]) que se encuentre dentro de un subdocumento presentaciones
router.put('/presentaciones/subdocs/:id/:idPresentacion/:seccionPresentacion/:idSeccionPresentacion', prodServController.putPresentacionSubdocument);


//----------DELETE-----------
//Ruta para eliminar un producto
router.delete("/:id", prodServController.deleteProdServItem);
//Ruta para eliminar un subdocumento a una sección de producto
router.delete(
  "/:id/:seccion/:idSeccion",
  prodServController.deleteProdServSubdocument
);

export default router;
