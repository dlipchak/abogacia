using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace AbogaciaCore.Helpers {
    public static class HMTLHelperExtensions {
        public static string IsSelected (this IHtmlHelper<dynamic> html, string action = null, string controller = null, string cssClass = null) {

            if (String.IsNullOrEmpty (cssClass))
                cssClass = "active";

            string currentAction = (string) html.ViewContext.RouteData.Values["action"];
            string currentController = (string) html.ViewContext.RouteData.Values["controller"];

            if (String.IsNullOrEmpty (controller))
                controller = currentController;

            if (String.IsNullOrEmpty (action))
                action = currentAction;

            return controller.ToLower () == currentController.ToLower () && (action == null || action.ToLower () == currentAction.ToLower ()) ?
                cssClass : String.Empty;
        }

        public static string PageClass (this IHtmlHelper<dynamic> html) {
            string currentAction = (string) html.ViewContext.RouteData.Values["action"];
            return currentAction;
        }

        public static bool IsCurrentController (this IHtmlHelper<dynamic> html, string controller = null) {
            string currentController = (string) html.ViewContext.RouteData.Values["controller"];
            return controller != null && controller.ToLower () == currentController.ToLower ();
        }
    }
}