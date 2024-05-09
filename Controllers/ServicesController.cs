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

namespace AbogaciaCore.Controllers {
    //[Route("Home/{action=index}")]
    [Route ("/Servicios/[action]")]
    public class ServicesController : Controller {

        private readonly Dictionary<ServiceCategory, string> categories;
        public ServicesController () {
            categories = new Dictionary<ServiceCategory, string> { { ServiceCategory.TrafficAccident, "Accidente de tránsito" },
                { ServiceCategory.Dismissals, "Despidos" },
                { ServiceCategory.WorkAccident, "Accidentes laborales" },
            };
        }

        [ActionName ("accidentes-en-transporte-publico")]
        public ActionResult AccidentsInPublicTransport () {
            var model = GetModel ("AccidentesEnTransportePublico");
            return View ("Services", model);
        }

        [ActionName ("accidentes-en-auto")]
        public ActionResult AccidentesInCar () {
            var model = GetModel ("AccidentesEnAuto");
            return View ("Services", model);
        }

        [ActionName ("accidentes-en-moto")]
        public ActionResult AccidentesInMotorbike () {
            var model = GetModel ("AccidentesEnMoto");
            return View ("Services", model);
        }

        [ActionName ("accidentes-en-bicicleta")]
        public ActionResult AccidentesInBike () {
            var model = GetModel ("AccidentesEnBicicleta");
            return View ("Services", model);
        }

        [ActionName ("accidentes-como-acompanantes")]
        public ActionResult AccidentesAsCompanions () {
            var model = GetModel ("AccidentesComoAcompanantes");
            return View ("Services", model);
        }

        [ActionName ("accidentes-como-peatón")]
        public ActionResult AccidentesAsPedestrian () {
            var model = GetModel ("AccidentesComoPeaton");
            return View ("Services", model);
        }

        [ActionName ("destruccion-total")]
        public ActionResult TotalDestruction () {
            var model = GetModel ("DestruccionTotal");
            return View ("Services", model);
        }

        [ActionName ("accidentes-de-trabajo")]
        public ActionResult WorkAccidentes () {
            var model = GetModel ("AccidentesDeTrabajo");
            return View ("Services", model);
        }

        [ActionName ("accidentes-in-itinere")]
        public ActionResult WalkingAccidentes () {
            var model = GetModel ("AccidentesInItinere");
            return View ("Services", model);
        }

        [ActionName ("enfermedades-profesionales")]
        public ActionResult ProfessionalIlnesses () {
            var model = GetModel ("EnfermedadesProfesionales");
            return View ("Services", model);
        }

        [ActionName ("como-actuar-ante-un-accidente-de-tránsito")]
        public ActionResult HowToActOnTrafficAccident () {
            var model = GetModel ("HowToActOnTrafficAccident");
            return View ("Services", model);
        }

        public ActionResult Covid19 () {
            var model = GetModel ("Covid19");
            return View ("Services",model);
        }

        // GET: home
        private ServiceModel GetModel (string service) {

            var model = new ServiceModel {
                Service = service,
                ServiceName = GetServiceName (service),
                ServiceCategory = GetServiceCategory (service),
                ImageName = GetImageName (service)
            };
            return model;
        }

        private string GetServiceCategory (string service) {
            switch (service) {
                case "AccidentesEnTransportePublico":
                    return categories[ServiceCategory.TrafficAccident];
                case "AccidentesEnAuto":
                    return categories[ServiceCategory.TrafficAccident];

                case "AccidentesEnMoto":
                    return categories[ServiceCategory.TrafficAccident];
                case "AccidentesEnBicicleta":
                    return categories[ServiceCategory.TrafficAccident];
                case "AccidentesComoAcompanantes":
                    return categories[ServiceCategory.TrafficAccident];
                case "AccidentesComoPeaton":
                    return categories[ServiceCategory.TrafficAccident];
                case "choqueSinSeguro":
                    return categories[ServiceCategory.TrafficAccident];
                case "DestruccionTotal":
                    return categories[ServiceCategory.TrafficAccident];
                case "HowToActOnTrafficAccident":
                    return categories[ServiceCategory.TrafficAccident];
                case "AccidentesDeTrabajo":
                    return categories[ServiceCategory.WorkAccident];
                case "AccidentesInItinere":
                    return categories[ServiceCategory.WorkAccident];

                case "EnfermedadesProfesionales":
                    return categories[ServiceCategory.WorkAccident];

                case "Covid19":
                    return categories[ServiceCategory.WorkAccident];

                default:
                    return categories[ServiceCategory.WorkAccident];

            }

        }

        private string GetServiceName (string service) {
            var ret = "";
            switch (service) {
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

        private string GetImageName (string image) {
            var ret = "";
            switch (image) {

                case "AccidentesEnMoto":
                    ret = "services/accidente-en-moto.jpg";
                    break;

                case "AccidentesComoPeaton":
                    ret = "services/peatónes.jpeg";
                    break;
                case "AccidentesEnAuto":
                    ret = "services/accidente-en-automovil.jpg";
                    break;
                case "AccidentesEnBicicleta":
                    ret = "services/accidente-en-bicicleta.jpg";
                    break;
                case "AccidentesEnTransportePublico":
                    ret = "services/accidente-en-transporte-publico.jpeg";
                    break;
                case "HowToActOnTrafficAccident":
                    ret = "services/accidentesDeTransito.jpeg";
                    break;
                case "AccidentesDeTrabajo":
                    ret = "services/accidentes-en-ocasión-del-trabajo.jpeg";
                    break;
                case "AccidentesComoAcompanantes":
                    ret = "services/accidentes-como-acompanantes.jpeg";
                    break;
                case "choqueSinSeguro":
                    ret = "services/choque-sin-seguro.jpeg";
                    break;
                case "DestruccionTotal":
                    ret = "services/destruccion-total.jpeg";
                    break;

                case "EnfermedadesProfesionales":
                    ret = "services/enfermedades-profesionales.jpeg";
                    break;

                case "AccidentesInItinere":
                    ret = "services/accidentes-initinere.jpeg";
                    break;
                case "Covid19":
                    ret = "services/accidentes-initinere.jpeg";
                    break;

            }
            return ret;
        }
    }
}