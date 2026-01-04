
export enum Difficulty {
  EASY = 'makkelijk',
  MEDIUM = 'gemiddeld',
  HARD = 'moeilijk'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'meerkeuze',
  CALCULATION = 'berekening',
  UNDERSTANDING = 'begrip',
  APPLICATION = 'toepassing'
}

export interface Question {
  learningGoal: string;
  questionType: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface GameState {
  currentGoalIndex: number;
  correctAnswersInGoal: number;
  totalCorrect: number;
  playerLevel: number;
  consecutiveWrong: number;
}

export const LEARNING_GOALS = [
  "Effect van prijsverandering op de afzet uitleggen",
  "Betalingsbereidheid en afnemend grensnut",
  "Substitutiegoederen uitleggen",
  "Complementaire goederen uitleggen",
  "Collectief consumentensurplus berekenen en arceren",
  "Collectieve vraaglijn berekenen en tekenen",
  "Effect van prijsverandering op de vraag uitleggen en berekenen",
  "Factoren die de collectieve vraag beïnvloeden",
  "Elasticiteit van de vraag (Ev) berekenen",
  "Elastische vs inelastische vraag uitleggen",
  "Effect van prijsverandering op de omzet bij elastische en inelastische vraag",
  "Inkomenselasticiteit (Ei) berekenen",
  "Normale, inferieure en luxe goederen onderscheiden",
  "Vier productiefactoren en bijbehorende vergoedingen",
  "Verband tussen productie en arbeid",
  "Vaste en variabele kosten uitleggen",
  "Rekenen met TK, GTK, VK en MK",
  "Winstmaximalisatie berekenen en grafisch bepalen",
  "Break-even point berekenen en grafisch bepalen",
  "Verband collectieve marktprijs en individueel aanbod",
  "Producentensurplus berekenen en arceren",
  "Vraag- en aanbodlijn construeren vanuit formules",
  "Marktevenwicht berekenen en aflezen",
  "Oorzaken van verschuivingen van vraag- en aanbodlijn",
  "Verschil tussen verschuivingen en beweging langs lijnen",
  "Effect op marktevenwicht bij verschuiving van vraaglijn",
  "Effect op marktevenwicht bij verschuiving van aanbodlijn"
];
