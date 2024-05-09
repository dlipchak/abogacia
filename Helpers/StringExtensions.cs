using System.Globalization;

namespace AbogaciaCore.Helpers {
    public static class StringExtensions {
        public static string ToTitleCase (this string title) {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase (title.ToLower ());
        }
        public static string Capitalize (this string title) {
            var lower = title.ToLower ();
            var capitalized = char.ToUpper (lower[0]) + lower.Substring (1);
            return capitalized;
        }

    }
}