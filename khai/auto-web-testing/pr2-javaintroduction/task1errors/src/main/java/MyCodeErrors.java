// Завдання 1: рядки 2 і 6, які НЕ компілюються.
class MyCodeErrors {
   public static void main (String[] args) {
       B ba = new A();   // рядок 2: incompatible types: A cannot be converted to B
       A ab = new B();
       ab.print2();      // рядок 6: cannot find symbol: method print2()
   }
}

class A {
   A() { System.out.println("Сlass A"); }
   public void print() { System.out.println("Method from A"); }
}

class B extends A {
   B() { System.out.println("Сlass B"); }
   public void print() { System.out.println("Method from B"); }
   public void print2() { System.out.println("Print2"); }
}
