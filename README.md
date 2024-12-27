//نظام اداره مكتبه
void main() {

var BOOK=Library();
BOOK.book();
print("------");
BOOK.titlebook="يوتوبيا";
BOOK.author="احمد خالد توفبق";
BOOK.bookstorename="shorock store";
BOOK.isbn="9770933074";
print("book is available");
print("book is name ${BOOK.titlebook}");
print("name author ${BOOK.author}");
print("name bookstorename ${BOOK.bookstorename}");
print("isbn is ${BOOK.isbn}");


}
class Library {
  String titlebook ="";
  String author="";
  String bookstorename ="";
  dynamic isbn ="";

 void book() {
print ("${this.titlebook} copies available");
  }
}

