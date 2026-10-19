// Завдання 1 (оригінальний код з методички). Активний лише рядок 1.
class MyCode {
   public static void main (String[] args) {

       A a = new A();          // рядок 1
      // B ba = new A();       // рядок 2 — помилка компіляції (див. модуль task1errors)
      // A ab = new B();       // рядок 3
      // B b = new B();        // рядок 4

      // ab.print();           // рядок 5
      // ab.print2();          // рядок 6 — помилка компіляції (див. модуль task1errors)
   }
}

class A {

   A() {
       System.out.println("Сlass A");
   }

   public void print() {
       System.out.println("Method from A");
   }
}

class B extends A {

   B() {
       System.out.println("Сlass B");
   }

   public void print() {
       System.out.println("Method from B");
   }

   public void print2() {
       System.out.println("Print2");
   }
}
