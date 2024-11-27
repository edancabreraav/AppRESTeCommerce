import * as mongoose from 'mongoose';

const prodservSchema = new mongoose.Schema({
    //IdInstitutoOK: { type: String },
    IdProdServOK: { type: String, required: true, unique: true },
    IdProdServBK: { type: String },
    CodigoBarras: { type: String },
    DesProdServ: { type: String },
    Indice: { type: String }, 
    estatus: [
        {
            IdTipoEstatusOK: { type: String },
            Actual: { type: String },
            Observacion: { type: String }
        }
    ],
    presentaciones: [
        {
            IdPresentaOK: { type: String },
            IdPresentaBK: { type: String },
            CodigoBarras: { type: String },
            DesPresenta: { type: String },
            Indice: { type: String },
            Principal: { type: String },
            estatus: [
                {
                    IdTipoEstatusOK: { type: String },
                    Actual: { type: String },
                    Observacion: { type: String },
                }
            ],
            info_vta: [
                {
                    IdEtiquetaOK: { type: String },
                    IdEtiqueta: { type: String },
                    Valor: { type: String },
                    IdTipoSeccionOK: { type: String },
                    Secuencia: { type: String }
                }
            ],
            archivos: [
                {
                    IdArchivoOK: { type: String },
                    IdArchivoBK: { type: String },
                    DesArchivo: { type: String },
                    RutaArchivo: { type: String },
                    Path: { type: String },
                    IdTipoArchivoOK: { type: String },
                    IdTipoSeccionOK: { type: String },
                    Secuencia: { type: Number },
                    Principal: { type: String }
                }
            ]
        }
    ],
    info_ad: [
        {
            IdEtiquetaOK: { type: String },
            IdEtiqueta: { type: String },
            Valor: { type: String },
            IdTipoSeccionOK: { type: String },
            Secuencia: { type: Number }
        }
    ]
});

export default mongoose.model(
    'cat_prod_serv',
    prodservSchema,
    'cat_prod_serv'
  );