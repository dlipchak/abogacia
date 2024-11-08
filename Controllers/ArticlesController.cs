using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web;
using AbogaciaCore.Models;
using Microsoft.AspNetCore.Mvc;

namespace AbogaciaCore.Controllers
{
    //[Route("Home/{action=index}")]
    [Route("/guias/[action]")]
    public class ArticlesController : Controller
    {

        private readonly Dictionary<ArticleCategory, string> categories;
        public ArticlesController()
        {
            categories = new Dictionary<ArticleCategory, string> { { ArticleCategory.TrafficAccident, "Accidente de tránsito" },
                { ArticleCategory.Dismissals, "Despidos" },
                { ArticleCategory.WorkAccident, "Accidentes laborales" },
            };
        }

        [ActionName("accidentes-en-transporte-publico")]
        public ActionResult AccidentsInPublicTransport()
        {
            var model = GetModel("AccidentesEnTransportePublico");
            return View("Articles", model);
        }

        [ActionName("accidentes-en-auto")]
        public ActionResult AccidentesInCar()
        {
            var model = GetModel("AccidentesEnAuto");
            return View("Articles", model);
        }

        [ActionName("accidentes-en-moto")]
        public ActionResult AccidentesInMotorbike()
        {
            var model = GetModel("AccidentesEnMoto");
            return View("Articles", model);
        }

        [ActionName("accidentes-en-bicicleta")]
        public ActionResult AccidentesInBike()
        {
            var model = GetModel("AccidentesEnBicicleta");
            return View("Articles", model);
        }

        [ActionName("accidentes-como-acompanantes")]
        public ActionResult AccidentesAsCompanions()
        {
            var model = GetModel("AccidentesComoAcompanantes");
            return View("Articles", model);
        }

        [ActionName("accidentes-como-peaton")]
        public ActionResult AccidentesAsPedestrian()
        {
            var model = GetModel("AccidentesComoPeaton");
            return View("Articles", model);
        }

        [ActionName("destruccion-total")]
        public ActionResult TotalDestruction()
        {
            var model = GetModel("DestruccionTotal");
            return View("Articles", model);
        }

        [ActionName("accidentes-de-trabajo")]
        public ActionResult WorkAccidentes()
        {
            var model = GetModel("AccidentesDeTrabajo");
            return View("Articles", model);
        }

        [ActionName("accidentes-in-itinere")]
        public ActionResult WalkingAccidentes()
        {
            var model = GetModel("AccidentesInItinere");
            return View("Articles", model);
        }

        [ActionName("enfermedades-profesionales")]
        public ActionResult ProfessionalIlnesses()
        {
            var model = GetModel("EnfermedadesProfesionales");
            return View("Articles", model);
        }

        [ActionName("como-actuar-ante-un-accidente-de-transito")]
        public ActionResult HowToActOnTrafficAccident()
        {
            var model = GetModel("HowToActOnTrafficAccident");
            return View("Articles", model);
        }

        public ActionResult Covid19()
        {
            var model = GetModel("Covid19");
            return View("Articles", model);
        }
        private ArticleModel GetModel(string article)
        {
            // Prepare article name and category first
            var articleName = GetArticleName(article);
            var articleCategory = GetArticleCategory(article);

            // Set the model
            var model = new ArticleModel
            {
                Article = article,
                ArticleName = articleName,
                ArticleCategory = articleCategory,
                ImageName = GetImageName(article)
            };

            // Get the SEO metadata
            var seoMetadata = GetArticleSeoMetadata(article);

            // Set dynamic SEO properties in ViewData
            ViewData["Title"] = seoMetadata.Title;
            ViewData["Description"] = seoMetadata.Description;
            ViewData["Keywords"] = seoMetadata.Keywords;

            return model;
        }

        private string GetArticleCategory(string article)
        {
            switch (article)
            {
                case "AccidentesEnTransportePublico":
                    return categories[ArticleCategory.TrafficAccident];
                case "AccidentesEnAuto":
                    return categories[ArticleCategory.TrafficAccident];

                case "AccidentesEnMoto":
                    return categories[ArticleCategory.TrafficAccident];
                case "AccidentesEnBicicleta":
                    return categories[ArticleCategory.TrafficAccident];
                case "AccidentesComoAcompanantes":
                    return categories[ArticleCategory.TrafficAccident];
                case "AccidentesComoPeaton":
                    return categories[ArticleCategory.TrafficAccident];
                case "choqueSinSeguro":
                    return categories[ArticleCategory.TrafficAccident];
                case "DestruccionTotal":
                    return categories[ArticleCategory.TrafficAccident];
                case "HowToActOnTrafficAccident":
                    return categories[ArticleCategory.TrafficAccident];
                case "AccidentesDeTrabajo":
                    return categories[ArticleCategory.WorkAccident];
                case "AccidentesInItinere":
                    return categories[ArticleCategory.WorkAccident];

                case "EnfermedadesProfesionales":
                    return categories[ArticleCategory.WorkAccident];

                case "Covid19":
                    return categories[ArticleCategory.WorkAccident];

                default:
                    return categories[ArticleCategory.WorkAccident];

            }

        }

        private ArticleSeoMetadata GetArticleSeoMetadata(string article)
        {
            var metadata = new ArticleSeoMetadata();

            switch (article)
            {
                case "AccidentesEnTransportePublico":
                    metadata.Title = "Asesoría Legal en Accidentes de Transporte Público | Estudio Jurídico López Giacomelli";
                    metadata.Description = "Asesoría jurídica experta en accidentes en transporte público. Contáctenos para obtener ayuda legal especializada en accidentes de tránsito.";
                    metadata.Keywords = "accidentes en transporte público, asesoría legal Buenos Aires, abogados en Argentina, Estudio Jurídico López Giacomelli";
                    break;

                case "AccidentesEnAuto":
                    metadata.Title = "Abogados en Accidentes de Auto | Estudio Jurídico López Giacomelli";
                    metadata.Description = "Obtenga asesoría jurídica en accidentes de auto. Especialistas en reclamos y acuerdos con aseguradoras en Argentina.";
                    metadata.Keywords = "accidentes de auto, asesoría legal Buenos Aires, abogados en Argentina, López Giacomelli";
                    break;

                case "AccidentesEnMoto":
                    metadata.Title = "Asesoría Jurídica en Accidentes de Moto | Estudio López Giacomelli";
                    metadata.Description = "Expertos en accidentes de moto. Asesoría legal en accidentes de tránsito para motociclistas en Argentina.";
                    metadata.Keywords = "accidentes de moto, asesoría legal Buenos Aires, abogados en Argentina";
                    break;

                case "AccidentesEnBicicleta":
                    metadata.Title = "Asesoría en Accidentes en Bicicleta | Estudio Jurídico López Giacomelli";
                    metadata.Description = "Asesoría legal en accidentes de bicicleta en Argentina. Contáctenos para ayuda profesional en accidentes de tránsito.";
                    metadata.Keywords = "accidentes en bicicleta, abogados en Argentina, asesoría legal Buenos Aires";
                    break;

                case "AccidentesComoAcompanantes":
                    metadata.Title = "Asesoría Legal en Accidentes como Acompañante | Estudio Jurídico";
                    metadata.Description = "Abogados en Argentina para accidentes como acompañante en transporte. Defensa de sus derechos en accidentes de tránsito.";
                    metadata.Keywords = "accidentes como acompañante, asesoría legal Buenos Aires, abogados en Argentina";
                    break;

                case "AccidentesComoPeaton":
                    metadata.Title = "Asesoría Jurídica en Accidentes como Peatón | López Giacomelli";
                    metadata.Description = "Asesoría legal para peatones en accidentes de tránsito. Proteja sus derechos con abogados especializados.";
                    metadata.Keywords = "accidentes como peatón, asesoría legal Buenos Aires, abogados en Argentina";
                    break;

                case "DestruccionTotal":
                    metadata.Title = "Asesoría en Destrucción Total de Vehículos | Estudio Jurídico";
                    metadata.Description = "Defensa legal en casos de destrucción total de vehículos. Asesoría especializada para reclamaciones de seguros en Argentina.";
                    metadata.Keywords = "destrucción total, accidentes de tránsito, abogados en Argentina, Buenos Aires";
                    break;

                case "AccidentesDeTrabajo":
                    metadata.Title = "Abogados en Accidentes de Trabajo | Estudio López Giacomelli";
                    metadata.Description = "Asesoría legal experta en accidentes de trabajo. Defendemos sus derechos laborales en Argentina.";
                    metadata.Keywords = "accidentes laborales, asesoría legal Buenos Aires, abogados en Argentina";
                    break;

                case "AccidentesInItinere":
                    metadata.Title = "Asesoría Legal en Accidentes In Itinere | Estudio Jurídico";
                    metadata.Description = "Especialistas en accidentes in itinere (camino al trabajo). Defensa de derechos laborales en Argentina.";
                    metadata.Keywords = "accidentes in itinere, asesoría legal Buenos Aires, abogados en Argentina";
                    break;

                case "EnfermedadesProfesionales":
                    metadata.Title = "Abogados en Enfermedades Profesionales | Estudio Jurídico López Giacomelli";
                    metadata.Description = "Asesoría en enfermedades profesionales y derechos laborales en Argentina. Defensa legal para trabajadores.";
                    metadata.Keywords = "enfermedades profesionales, asesoría legal, abogados en Buenos Aires, Argentina";
                    break;

                case "HowToActOnTrafficAccident":
                    metadata.Title = "Cómo Actuar Ante un Accidente de Tránsito | Estudio Jurídico";
                    metadata.Description = "Consejos sobre cómo actuar ante un accidente de tránsito. Asesoría legal en accidentes de tránsito en Argentina.";
                    metadata.Keywords = "cómo actuar en accidente de tránsito, asesoría legal en Buenos Aires, abogados en Argentina";
                    break;

                case "Covid19":
                    metadata.Title = "Asesoría Legal en Casos de COVID-19 y Derechos Laborales | Estudio Jurídico";
                    metadata.Description = "Protección de derechos laborales ante COVID-19. Asesoría legal en casos de COVID-19 en el trabajo en Argentina.";
                    metadata.Keywords = "covid-19, derechos laborales Buenos Aires, asesoría legal en Argentina";
                    break;

                default:
                    // General fallback for unknown Articles
                    metadata.Title = "Asesoría Legal en Argentina | Estudio Jurídico López Giacomelli";
                    metadata.Description = "Asesoría legal profesional en Argentina. Contáctenos para asistencia legal especializada.";
                    metadata.Keywords = "asesoría legal, abogados en Buenos Aires, Argentina, Estudio Jurídico López Giacomelli";
                    break;
            }

            return metadata;
        }

        private string GetArticleName(string article)
        {
            var ret = "";
            switch (article)
            {
                case "AccidentesEnTransportePublico":
                    ret = "ACCIDENTES EN TRANSPORTE PUBLICO";
                    break;
                case "AccidentesEnAuto":
                    ret = "ACCIDENTES EN AUTO";
                    break;
                case "AccidentesEnMoto":
                    ret = "ACCIDENTES EN MOTO";
                    break;
                case "AccidentesEnBicicleta":
                    ret = "ACCIDENTES EN BICICLETA";
                    break;
                case "AccidentesComoAcompanantes":
                    ret = "ACCIDENTES COMO ACOMPAÑANTE";
                    break;
                case "AccidentesComoPeaton":
                    ret = "ACCIDENTES COMO PEATÓN";
                    break;
                case "choqueSinSeguro":
                    ret = "CHOCÓ Y NO TENÍA PAGO SU SEGURO";
                    break;
                case "DestruccionTotal":
                    ret = "DESTRUCCIÓN TOTAL";
                    break;
                case "AccidentesDeTrabajo":
                    ret = "ACCIDENTES EN OCASIÓN DEL TRABAJO";
                    break;
                case "AccidentesInItinere":
                    ret = "ACCIDENTES IN ITINERE (CAMINO AL TRABAJO, O DE REGRESO A CASA)";
                    break;

                case "EnfermedadesProfesionales":
                    ret = "ENFERMEDADES PROFESIONALES";
                    break;
                case "HowToActOnTrafficAccident":
                    ret = "COMO ACTUAR ANTE UN ACCIDENTE DE TRÁNSITO";
                    break;

                case "Covid19":
                    ret = "COVID-19";
                    break;

            }
            return ret;
        }

        private string GetImageName(string image)
        {
            var ret = "";
            switch (image)
            {

                case "AccidentesEnMoto":
                    ret = "Articles/accidente-en-moto.jpg";
                    break;

                case "AccidentesComoPeaton":
                    ret = "Articles/peatónes.jpeg";
                    break;
                case "AccidentesEnAuto":
                    ret = "Articles/accidente-en-automovil.jpg";
                    break;
                case "AccidentesEnBicicleta":
                    ret = "Articles/accidente-en-bicicleta.jpg";
                    break;
                case "AccidentesEnTransportePublico":
                    ret = "Articles/accidente-en-transporte-publico.jpeg";
                    break;
                case "HowToActOnTrafficAccident":
                    ret = "Articles/accidentesDeTransito.jpeg";
                    break;
                case "AccidentesDeTrabajo":
                    ret = "Articles/accidentes-en-ocasión-del-trabajo.jpeg";
                    break;
                case "AccidentesComoAcompanantes":
                    ret = "Articles/accidentes-como-acompanantes.jpeg";
                    break;
                case "choqueSinSeguro":
                    ret = "Articles/choque-sin-seguro.jpeg";
                    break;
                case "DestruccionTotal":
                    ret = "Articles/destruccion-total.jpeg";
                    break;

                case "EnfermedadesProfesionales":
                    ret = "Articles/enfermedades-profesionales.jpeg";
                    break;

                case "AccidentesInItinere":
                    ret = "Articles/accidentes-initinere.jpeg";
                    break;
                case "Covid19":
                    ret = "Articles/accidentes-initinere.jpeg";
                    break;

            }
            return ret;
        }
    }
}