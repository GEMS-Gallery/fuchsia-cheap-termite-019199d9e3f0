import React, { useState } from 'react';
import { Button, Grid, Paper, TextField, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../declarations/backend/backend.did.js";

const agent = new HttpAgent();
const backend = Actor.createActor(idlFactory, { agent, canisterId: process.env.BACKEND_CANISTER_ID });

const CalculatorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 300,
  margin: 'auto',
}));

const DisplayTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '1.5rem',
    textAlign: 'right',
  },
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState('');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNumberClick = (num: string) => {
    if (waitingForSecondOperand) {
      setDisplay(num);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperationClick = (op: string) => {
    if (firstOperand === null) {
      setFirstOperand(parseFloat(display));
    } else if (!waitingForSecondOperand) {
      handleEqualsClick();
    }
    setOperation(op);
    setWaitingForSecondOperand(true);
  };

  const handleEqualsClick = async () => {
    if (firstOperand === null || waitingForSecondOperand) return;

    setLoading(true);
    try {
      const result = await backend.calculate(operation, firstOperand, parseFloat(display));
      switch (result.tag) {
        case 'ok':
          setDisplay(result.val.toString());
          break;
        case 'err':
          setDisplay('Error');
          break;
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setDisplay('Error');
    }
    setLoading(false);
    setFirstOperand(null);
    setOperation('');
    setWaitingForSecondOperand(true);
  };

  const handleClearClick = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperation('');
    setWaitingForSecondOperand(false);
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <CalculatorPaper elevation={3}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DisplayTextField
            fullWidth
            variant="outlined"
            value={display}
            InputProps={{
              readOnly: true,
              endAdornment: loading && <CircularProgress size={20} />,
            }}
          />
        </Grid>
        {buttons.map((btn) => (
          <Grid item xs={3} key={btn}>
            <Button
              fullWidth
              variant="contained"
              color={['+', '-', '*', '/'].includes(btn) ? 'primary' : 'secondary'}
              onClick={() => {
                if (btn === '=') handleEqualsClick();
                else if (['+', '-', '*', '/'].includes(btn)) handleOperationClick(btn);
                else handleNumberClick(btn);
              }}
              disabled={loading}
            >
              {btn}
            </Button>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleClearClick}
            disabled={loading}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </CalculatorPaper>
  );
};

export default App;
