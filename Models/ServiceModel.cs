using System;

namespace AbogaciaCore.Models {

    public enum ServiceCategory {
        TrafficAccident,
        WorkAccident,
        Dismissals
    }
    public class ServiceModel {
        public string Service { get; set; }
        public string ServiceName { get; set; }
        public string ServiceCategory { get; set; }
        public string ImageName { get; set; }
    }
}