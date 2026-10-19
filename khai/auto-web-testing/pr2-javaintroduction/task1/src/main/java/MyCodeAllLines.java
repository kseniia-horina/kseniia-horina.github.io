// Завдання 1: усі рядки, що компілюються, розкоментовано.
// Рядок 6 виправлено приведенням типу ((B) ab).print2().
class MyCodeAllLines {
   public static void main (String[] args) {
       System.out.println("--- line 1: A a = new A();");
       A a = new A();
       System.out.println("--- line 3: A ab = new B();");
       A ab = new B();
       System.out.println("--- line 4: B b = new B();");
       B b = new B();
       System.out.println("--- line 5: ab.print();");
       ab.print();
       System.out.println("--- line 6 (fixed): ((B) ab).print2();");
       ((B) ab).print2();
   }
}
