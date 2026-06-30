import { useState } from 'react';
import { Mic, MicOff, AlertCircle, X, Check, ArrowRight } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { parseVoiceCommand } from '@/utils/voiceParser';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import notesService from '@/services/notesService';
import financeService from '@/services/financeService';
import studentService from '@/services/studentService';
import { useAuth } from '@/hooks/useAuth';

const VoiceButton = ({ className }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [parsedCommand, setParsedCommand] = useState(null);
  const [executionStatus, setExecutionStatus] = useState('');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleTranscript = (text) => {
    const result = parseVoiceCommand(text);
    setParsedCommand(result);
  };

  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported
  } = useVoiceInput(handleTranscript);

  const handleOpen = () => {
    if (!isSupported) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    setParsedCommand(null);
    setExecutionStatus('');
    setModalOpen(true);
    // Auto-start listening after modal opens
    setTimeout(() => {
      startListening();
    }, 300);
  };

  const handleClose = () => {
    stopListening();
    setModalOpen(false);
  };

  const handleExecute = async () => {
    if (!parsedCommand) return;
    try {
      setExecutionStatus('processing');
      if (parsedCommand.type === 'NOTE') {
        const res = await notesService.addNote(parsedCommand.data);
        if (res.success) {
          setExecutionStatus('success');
          refreshUser();
          setTimeout(() => {
            handleClose();
            navigate('/notes');
          }, 1000);
        }
      } else if (parsedCommand.type === 'EXPENSE') {
        const res = await financeService.addTransaction(parsedCommand.data);
        if (res.success) {
          setExecutionStatus('success');
          refreshUser();
          setTimeout(() => {
            handleClose();
            navigate('/finance');
          }, 1000);
        }
      } else if (parsedCommand.type === 'ASSIGNMENT') {
        // Find first subject to bind assignment
        const subjectsRes = await studentService.getSubjects();
        const subjects = subjectsRes.data || [];
        const subjectId = subjects.length > 0 ? subjects[0].id : null;
        
        if (!subjectId) {
          alert('Create a subject first before logging academic tasks.');
          setExecutionStatus('error');
          return;
        }

        const res = await studentService.addAssignment({
          ...parsedCommand.data,
          subjectId
        });
        if (res.success) {
          setExecutionStatus('success');
          refreshUser();
          setTimeout(() => {
            handleClose();
            navigate('/student');
          }, 1000);
        }
      } else if (parsedCommand.type === 'NAVIGATION') {
        setExecutionStatus('success');
        setTimeout(() => {
          handleClose();
          navigate(parsedCommand.data.path);
        }, 1000);
      } else {
        alert(`No direct action for command: "${parsedCommand.data.text}". Try: "spent 100 on Food"`);
        setExecutionStatus('error');
      }
    } catch (err) {
      console.error('Failed to execute command:', err);
      setExecutionStatus('error');
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover transition-colors cursor-pointer ${className}`}
        title="Voice Command Mode"
        aria-label="Voice Input"
      >
        <Mic className="w-5 h-5" />
      </button>

      <Modal isOpen={modalOpen} onClose={handleClose} title="SiriOS Voice Assistant" size="sm">
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
          {/* Pulsing Visual Ring */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
            )}
            <div
              onClick={isListening ? stopListening : startListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                isListening
                  ? 'bg-danger text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-primary text-white hover:bg-primary-hover shadow-lg'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </div>
          </div>

          <div className="space-y-2 w-full">
            <h3 className="text-sm font-semibold text-text">
              {isListening ? 'Listening...' : 'Tap Mic to Start'}
            </h3>
            <p className="text-xs text-text-faint max-w-xs mx-auto">
              Try: "spent 150 on Food", "create note Homework", "add task study DBMS"
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="w-full bg-bg-input border border-border p-3.5 rounded-xl text-left">
              <span className="text-[10px] font-bold text-text-faint block uppercase tracking-wider mb-1">
                Transcript
              </span>
              <p className="text-xs text-text leading-relaxed font-medium">"{transcript}"</p>
            </div>
          )}

          {/* Parsed Result Block */}
          {parsedCommand && parsedCommand.type !== 'UNKNOWN' && (
            <div className="w-full bg-primary-muted/10 border border-primary-muted/20 p-4 rounded-xl text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">
                  Parsed Command
                </span>
                <Badge variant={parsedCommand.type === 'NOTE' ? 'primary' : parsedCommand.type === 'EXPENSE' ? 'danger' : 'success'}>
                  {parsedCommand.type}
                </Badge>
              </div>
              <div className="space-y-1.5 text-xs text-text-secondary">
                {parsedCommand.type === 'NOTE' && (
                  <p>Title: <span className="font-semibold text-text">"{parsedCommand.data.title}"</span></p>
                )}
                {parsedCommand.type === 'EXPENSE' && (
                  <>
                    <p>Amount: <span className="font-semibold text-rose-400">₹{parsedCommand.data.amount}</span></p>
                    <p>Category: <span className="font-semibold text-text">{parsedCommand.data.category}</span></p>
                    <p>Description: <span className="font-semibold text-text">"{parsedCommand.data.description}"</span></p>
                  </>
                )}
                {parsedCommand.type === 'ASSIGNMENT' && (
                  <p>Task: <span className="font-semibold text-emerald-400">"{parsedCommand.data.title}"</span></p>
                )}
              </div>
              
              <Button
                variant="primary"
                onClick={handleExecute}
                disabled={executionStatus === 'processing'}
                className="w-full mt-2"
                icon={executionStatus === 'processing' ? null : <Check className="w-4 h-4" />}
              >
                {executionStatus === 'processing'
                  ? 'Executing...'
                  : executionStatus === 'success'
                  ? 'Success!'
                  : 'Confirm & Execute'}
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/30 text-red-200/90 rounded-xl text-xs w-full text-left">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default VoiceButton;
