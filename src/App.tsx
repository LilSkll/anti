import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { TextAnalysis } from "@/pages/TextAnalysis";
import { Comparison } from "@/pages/Comparison";
import { Semiotic } from "@/pages/Semiotic";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<TextAnalysis />} />
        <Route path="/compare" element={<Comparison />} />
        <Route path="/semiotic" element={<Semiotic />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
