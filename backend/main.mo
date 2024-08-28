import Float "mo:base/Float";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Result "mo:base/Result";

actor Calculator {
  public func calculate(operation: Text, operand1: Float, operand2: Float) : async Result.Result<Float, Text> {
    switch (operation) {
      case ("+") { #ok(operand1 + operand2) };
      case ("-") { #ok(operand1 - operand2) };
      case ("*") { #ok(operand1 * operand2) };
      case ("/") {
        if (operand2 == 0) {
          #err("Division by zero")
        } else {
          #ok(operand1 / operand2)
        }
      };
      case (_) { #err("Invalid operation") };
    }
  };
}
