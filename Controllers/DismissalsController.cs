using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AbogaciaCore.Models;
using Microsoft.AspNetCore.Mvc;

namespace AbogaciaCore.Controllers {

     [Route ("/despidos/[action]")]
    public class DismissalsController : Controller {

        [ActionName ("derechos-del-trabajador")]
        public ActionResult WorkerRights () {
            return View ("WorkerRights");
        }
    }
}