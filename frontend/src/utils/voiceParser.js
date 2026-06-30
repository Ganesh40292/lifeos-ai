const numberWords = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000
};

const parseWordsToNumber = (str) => {
  const words = str.toLowerCase().split(/[\s-]+/);
  let total = 0;
  let temp = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (numberWords[w] !== undefined) {
      const val = numberWords[w];
      if (val === 100) {
        temp = (temp || 1) * 100;
      } else if (val === 1000) {
        total += (temp || 1) * 1000;
        temp = 0;
      } else {
        temp += val;
      }
    } else if (/^\d+$/.test(w)) {
      temp += parseInt(w, 10);
    }
  }
  return total + temp;
};

export const parseVoiceCommand = (text) => {
  const cleanText = text.trim().toLowerCase();
  
  // 1. Check for Expense/Transaction
  // Examples: "spent 150 on food", "log expense 300 rupees for dinner", "add transaction 50 for tickets"
  const expenseKeywords = ['spent', 'log expense', 'add expense', 'expense', 'cost', 'bought', 'paid'];
  const isExpense = expenseKeywords.some(keyword => cleanText.includes(keyword));

  if (isExpense) {
    // Extract numbers from text (either digits or word representation)
    let amount = 0;
    const numberMatches = cleanText.match(/\b\d+\b/g);
    if (numberMatches) {
      amount = parseFloat(numberMatches[0]);
    } else {
      amount = parseWordsToNumber(cleanText);
    }

    // Determine category
    const categories = ['food', 'transport', 'shopping', 'housing', 'entertainment', 'utilities', 'leisure', 'education', 'other'];
    let category = 'Other';
    for (const cat of categories) {
      if (cleanText.includes(cat)) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }

    // Determine description
    let description = '';
    // Look for phrases like "on [desc]" or "for [desc]"
    const forMatch = text.match(/for\s+(.+)/i);
    const onMatch = text.match(/on\s+(.+)/i);
    if (onMatch) {
      description = onMatch[1];
    } else if (forMatch) {
      description = forMatch[1];
    } else {
      description = text;
    }

    // Strip categories from description if duplicated
    description = description.replace(new RegExp(category, 'gi'), '').trim();

    return {
      type: 'EXPENSE',
      data: {
        amount: amount || 0,
        category,
        description: description || 'Voice logged expense',
        type: 'EXPENSE'
      }
    };
  }

  // 2. Check for Note
  // Examples: "create note shopping list", "add note project ideas", "new note quick thoughts"
  const noteKeywords = ['create note', 'add note', 'new note', 'write note', 'note down', 'note'];
  let isNote = false;
  let notePrefix = '';
  for (const keyword of noteKeywords) {
    if (cleanText.startsWith(keyword)) {
      isNote = true;
      notePrefix = keyword;
      break;
    }
  }

  if (isNote) {
    const title = text.slice(notePrefix.length).trim();
    return {
      type: 'NOTE',
      data: {
        title: title || 'Untitled Note',
        content: '',
        folder: 'General',
        tags: 'voice-input'
      }
    };
  }

  // 3. Check for Assignment / Study Tasks
  // Examples: "add task study database", "study math assignment tomorrow", "add assignment algorithms due friday"
  const taskKeywords = ['add task', 'new task', 'add assignment', 'new assignment', 'study', 'assignment'];
  let isTask = false;
  let taskPrefix = '';
  for (const keyword of taskKeywords) {
    if (cleanText.includes(keyword)) {
      isTask = true;
      taskPrefix = keyword;
      break;
    }
  }

  if (isTask) {
    let title = text;
    if (cleanText.startsWith(taskPrefix)) {
      title = text.slice(taskPrefix.length).trim();
    }
    return {
      type: 'ASSIGNMENT',
      data: {
        title: title || 'New Assignment',
        priority: 'MEDIUM',
        dueDate: new Date().toISOString().split('T')[0]
      }
    };
  }

  // 4. Check for Navigation
  // Examples: "go to focus", "navigate to finance", "open settings", "show dashboard"
  const navKeywords = ['go to', 'navigate to', 'show', 'open', 'redirect to', 'goto'];
  let isNav = false;
  let targetPath = '';
  let targetName = '';

  for (const keyword of navKeywords) {
    if (cleanText.includes(keyword)) {
      const remainder = cleanText.substring(cleanText.indexOf(keyword) + keyword.length).trim();
      if (remainder.includes('focus') || remainder.includes('room') || remainder.includes('timer')) {
        isNav = true;
        targetPath = '/focus';
        targetName = 'Focus Room';
      } else if (remainder.includes('finance') || remainder.includes('money') || remainder.includes('budget')) {
        isNav = true;
        targetPath = '/finance';
        targetName = 'Finance';
      } else if (remainder.includes('note') || remainder.includes('ledger') || remainder.includes('document')) {
        isNav = true;
        targetPath = '/notes';
        targetName = 'Notes';
      } else if (remainder.includes('academics') || remainder.includes('student') || remainder.includes('study') || remainder.includes('subject')) {
        isNav = true;
        targetPath = '/student';
        targetName = 'Academics';
      } else if (remainder.includes('health') || remainder.includes('workout') || remainder.includes('fitness')) {
        isNav = true;
        targetPath = '/health';
        targetName = 'Health';
      } else if (remainder.includes('settings') || remainder.includes('appearance') || remainder.includes('profile')) {
        isNav = true;
        targetPath = '/settings';
        targetName = 'Settings';
      } else if (remainder.includes('dashboard') || remainder.includes('home') || remainder.includes('main')) {
        isNav = true;
        targetPath = '/';
        targetName = 'Dashboard';
      } else if (remainder.includes('skill') || remainder.includes('tree')) {
        isNav = true;
        targetPath = '/skills';
        targetName = 'Skill Tree';
      }
      if (isNav) break;
    }
  }

  if (isNav) {
    return {
      type: 'NAVIGATION',
      data: {
        path: targetPath,
        name: targetName,
        text: `Navigate to ${targetName}`
      }
    };
  }

  // Fallback: search query or show parsed preview
  return {
    type: 'UNKNOWN',
    data: {
      text
    }
  };
};
