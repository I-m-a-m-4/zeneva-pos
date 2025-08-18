
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Minus, Divide, Percent, Dot } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function CalculatorModal({ isOpen, onOpenChange }: CalculatorModalProps) {
  const [displayValue, setDisplayValue] = React.useState("0");
  const [firstOperand, setFirstOperand] = React.useState<number | null>(null);
  const [operator, setOperator] = React.useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = React.useState(false);
  const [history, setHistory] = React.useState<string>("");

  const inputDigit = React.useCallback((digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(prev => (prev === "0" && digit !== ".") ? digit : prev + digit);
    }
  }, [waitingForSecondOperand]);

  const inputDecimal = React.useCallback(() => {
    if (waitingForSecondOperand) {
      setDisplayValue("0.");
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes(".")) {
      setDisplayValue(prev => prev + ".");
    }
  }, [displayValue, waitingForSecondOperand]);

  const clearAll = React.useCallback(() => {
    setDisplayValue("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHistory("");
  }, []);
  
  const clearEntry = React.useCallback(() => {
    setDisplayValue("0");
    // If waitingForSecondOperand is true, it means an operator was just pressed.
    // CE should probably allow re-entering the second number without clearing the operation.
    if (waitingForSecondOperand && operator && firstOperand !== null) {
        // Keep operator and firstOperand, just reset display for second number.
        // User can now enter a new second number.
    } else if (!waitingForSecondOperand && operator && firstOperand !== null) {
        // User was typing the second operand, just clear that.
    } else {
        // Clearing the first operand entry or a result.
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
        setHistory("");
    }
  }, [operator, firstOperand, waitingForSecondOperand]);

  const calculate = (operand1: number, operand2: number, op: string): number => {
    switch (op) {
      case "+": return operand1 + operand2;
      case "-": return operand1 - operand2;
      case "*": return operand1 * operand2;
      case "/":
        if (operand2 === 0) {
          alert("Cannot divide by zero");
          clearAll(); // Reset on error
          return 0; 
        }
        return operand1 / operand2;
      case "%": 
        return (operand1 * operand2) / 100; // Assumes "operand1 % of operand2" or "operand2 % of operand1"
                                            // Standard calculator behavior might be just (operand1/100) * operand2 if op1 is percent
                                            // For simplicity using (op1 * op2) / 100, like a discount.
                                            // Or, if it's to find percentage: (operand1 / 100) * operand2
                                            // Let's use a simpler model: displayValue becomes a percentage of firstOperand
                                            // Or simply, displayValue / 100
                                            // Actually, common behavior: 100 + 10% -> 100 + (10/100 * 100) = 110
                                            // So, op2 is the percentage value, applied to op1
         return operand1 * (operand2 / 100);


      default: return operand2;
    }
  };
  
  const performOperation = React.useCallback((nextOperator: string) => {
    const currentInputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      // An operator was already active, user is changing it
      setOperator(nextOperator);
      if (firstOperand !== null) {
        setHistory(`${firstOperand} ${operatorSymbol(nextOperator)}`);
      } else { // Should not happen if logic is sound, but a fallback
        setHistory(`${currentInputValue} ${operatorSymbol(nextOperator)}`);
      }
      return;
    }

    if (firstOperand !== null && operator !== null && !waitingForSecondOperand) {
      // An operation is ready to be calculated (e.g., 5 + 3, then user presses -)
      const result = calculate(firstOperand, currentInputValue, operator);
      setDisplayValue(String(parseFloat(result.toFixed(7))));
      setFirstOperand(result);
      setHistory(`${result} ${operatorSymbol(nextOperator)}`);
    } else {
      // This is the first operator in a new calculation, or after an equals
      setFirstOperand(currentInputValue);
      setHistory(`${currentInputValue} ${operatorSymbol(nextOperator)}`);
    }
    
    setOperator(nextOperator);
    setWaitingForSecondOperand(true);
  }, [displayValue, firstOperand, operator, waitingForSecondOperand, clearAll]);


  const handleEquals = React.useCallback(() => {
    const currentInputValue = parseFloat(displayValue);
    if (firstOperand !== null && operator !== null) {
      let finalSecondOperand = currentInputValue;
      if (waitingForSecondOperand) { 
        // Case: 5 + = (use firstOperand as secondOperand)
        finalSecondOperand = firstOperand;
      }

      const result = calculate(firstOperand, finalSecondOperand, operator);
      setHistory(`${firstOperand} ${operatorSymbol(operator)} ${finalSecondOperand} =`);
      setDisplayValue(String(parseFloat(result.toFixed(7))));
      
      setFirstOperand(result); // Result becomes the new first operand for potential chaining
      setOperator(null); // Clear the operator
      setWaitingForSecondOperand(true); // Ready for a new number or operator
    }
    // If no firstOperand or operator, equals does nothing or just shows current displayValue
  }, [firstOperand, operator, displayValue, waitingForSecondOperand, clearAll]);
  

  const toggleSign = React.useCallback(() => {
    setDisplayValue(prev => {
      if (prev === "0") return "0";
      const numValue = parseFloat(prev);
      return String(numValue * -1);
    });
    // If waitingForSecondOperand, it means sign toggle applies to next input.
    // If not, it applies to current display which might be first or second operand.
  }, []);

  const operatorSymbol = (op: string | null) => {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  }

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, shiftKey } = event;
      if (key >= '0' && key <= '9' && !shiftKey) inputDigit(key);
      else if (key === '.') inputDecimal();
      else if (key === '+') performOperation('+');
      else if (key === '-') performOperation('-');
      else if (key === '*') performOperation('*');
      else if (key === '/') performOperation('/');
      else if (key === '%' || (key === '5' && shiftKey)) { // Shift+5 is %
        event.preventDefault();
        performOperation('%');
      }
      else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEquals();
      }
      else if (key === 'Backspace') {
         setDisplayValue(prev => {
            if (waitingForSecondOperand) return "0"; // If waiting, backspace clears placeholder 0
            return prev.length > 1 ? prev.slice(0, -1) : "0";
         });
         // If display becomes "0" and an operation was pending for the second number,
         // we might want to set waitingForSecondOperand to true if it wasn't already.
         // This behavior can be tricky. For now, simple slice.
      }
      else if (key === 'Escape') clearAll();
      else if (key.toLowerCase() === 'c' && !event.ctrlKey && !event.metaKey) { // Avoid conflict with Copy
        if (displayValue !== "0"){
            clearEntry();
        } else {
            clearAll(); // If display is already 0, C acts as AC
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputDigit, inputDecimal, performOperation, handleEquals, clearAll, clearEntry, displayValue, waitingForSecondOperand, firstOperand]);


  const buttons = [
    { label: "CE", handler: clearEntry, className: "bg-muted hover:bg-muted/80 text-destructive/80" },
    { label: "C", handler: clearAll, className: "bg-muted hover:bg-muted/80 text-destructive" },
    { label: <Percent size={20}/>, handler: () => performOperation("%"), className: "bg-muted hover:bg-muted/80 text-primary" },
    { label: <Divide size={20}/>, handler: () => performOperation("/"), className: "bg-primary/80 hover:bg-primary/70 text-primary-foreground" },
    
    { label: "7", handler: () => inputDigit("7"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "8", handler: () => inputDigit("8"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "9", handler: () => inputDigit("9"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: <X size={20}/>, handler: () => performOperation("*"), className: "bg-primary/80 hover:bg-primary/70 text-primary-foreground" },
    
    { label: "4", handler: () => inputDigit("4"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "5", handler: () => inputDigit("5"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "6", handler: () => inputDigit("6"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: <Minus size={20}/>, handler: () => performOperation("-"), className: "bg-primary/80 hover:bg-primary/70 text-primary-foreground" },

    { label: "1", handler: () => inputDigit("1"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "2", handler: () => inputDigit("2"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "3", handler: () => inputDigit("3"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: <Plus size={20}/>, handler: () => performOperation("+"), className: "bg-primary/80 hover:bg-primary/70 text-primary-foreground" },

    { label: "+/-", handler: toggleSign, className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "0", handler: () => inputDigit("0"), className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: <Dot size={24} className="mx-auto"/>, handler: inputDecimal, className: "bg-card hover:bg-muted/50 text-foreground" },
    { label: "=", handler: handleEquals, className: "bg-green-600 hover:bg-green-700 text-white" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs p-0 shadow-2xl rounded-lg border-none bg-background/95 backdrop-blur-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base text-center text-muted-foreground font-normal">Calculator</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-1 space-y-2">
          <div className="h-8 text-xs text-right text-muted-foreground truncate px-1" data-ai-hint="calculator history display">
            {history}
          </div>
          <Input
            type="text"
            value={displayValue}
            readOnly
            className="text-right text-5xl font-mono h-20 bg-transparent border-none shadow-inner p-2 focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-primary/20"
            data-ai-hint="calculator display output"
            aria-live="polite"
          />
          <div className="grid grid-cols-4 gap-1.5">
            {buttons.map((btn, index) => (
              <Button
                key={index}
                variant="outline"
                className={`text-xl p-0 h-16 flex items-center justify-center rounded-md shadow-sm hover:shadow-md focus:z-10 focus:ring-1 focus:ring-offset-0 focus:ring-primary/50 border-border/50
                ${btn.className || ""} 
                ${operator && operatorSymbol(operator) === btn.label && waitingForSecondOperand ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${operator && btn.label === operatorSymbol(operator) && waitingForSecondOperand ? 'bg-primary/70 text-primary-foreground' : ''}
                `}
                onClick={(e) => {
                    btn.handler();
                    (e.currentTarget as HTMLButtonElement).blur(); // Remove focus after click
                }}
                aria-label={typeof btn.label === 'string' ? btn.label : `operator ${index}`}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

