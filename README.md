
# LFU Cache Visual Simulator — Optimization & Analysis System

A web-based **algorithm visualization and benchmarking platform** that implements and analyzes **LFU (Least Frequently Used)** cache behavior under dynamic workloads.

The system simulates real-world caching scenarios, compares multiple replacement policies (**LFU, LRU, FIFO**), and computes performance metrics such as **hit rate, latency, and total execution time**.

---

## 🔗 Live Demo

https://lfu-cache.netlify.app/

---

## 🧠 Core Concept

The application models cache systems as a **state-driven process**, where each operation (GET / PUT) modifies cache structure and frequency distribution.

It uses:

- **Hash map (O(1) access)**
- **Frequency buckets (doubly linked lists)**
- **LRU tie-breaking within frequency groups**

to guarantee **O(1) complexity** for both get and put.

Unlike simple implementations, this system introduces:

- Multiple workload patterns (Uniform, Zipf, Sequential, Temporal)
- Real-time visualization of internal cache structure
- Benchmarking engine for fair policy comparison
- Dynamic performance analysis

---

## ✨ Key Features

| Category | Description |
|----------|------------|
| 🚀 Solver | Executes LFU, LRU, FIFO with identical workloads |
| 📊 Benchmark | Computes hit rate, miss rate, latency, and wall time |
| 🎬 Visualization | Real-time cache structure (frequency buckets, operation logs) |
| 🔁 Simulation | Step-by-step execution (LeetCode-style scenarios) |
| ⚙️ Configurable | Capacity, operations, read/write ratio, and access patterns |
| 📈 Analysis | Compares policies under different workload distributions |
| 📤 Export | Results export as PNG, SVG, and Excel |
| 🌍 i18n | Multilingual support (English / Albanian) |
| 🎨 UI/UX | Dark & Light mode with modern interface |
| 📱 Responsive | Optimized for desktop and mobile devices |

## 📁 Project Structure

```

lfu-cache-visual-simulator
│
├── src/
│   ├── core/           # LFU, LRU, FIFO algorithms (O(1) implementations)
│   ├── hooks/          # Benchmark logic, orchestration, demo engine
│   ├── components/     # UI components (visualizer, charts, layout)
│   ├── pages/          # Visualizer, Benchmark, Theory
│   ├── utils/          # Export utilities (PNG, SVG, Excel)
│   ├── i18n/           # Translations and theory content
│   ├── styles/         # Styling and themes
│   ├── types.ts        # Shared types
│   ├── App.tsx
│   └── main.tsx

```

---

## ⚙️ How It Works

### Cache Logic

- Each key maintains a **frequency counter**
- Keys with same frequency are grouped
- Each group maintains **LRU order**

### Eviction Policy (LFU)

1. Select lowest frequency  
2. If tie → select least recently used  
3. Remove node from structure  

---

### Benchmark Process

1. Generate operation sequence (GET / PUT)  
2. Apply same sequence to:
   - LFU  
   - LRU  
   - FIFO  
3. Measure:
   - Hits / Misses (GET only)  
   - Latency (average per operation)  
   - Wall time (total execution time)  

---

## 📊 Performance Metrics

- **Hit Rate** → % of successful GET operations  
- **Miss Rate** → % of failed GET operations  
- **Latency** → average time per operation (μs)  
- **Wall Time** → total execution duration  

---

## 🧰 Technologies Used

| Technology | Purpose |
|------------|--------|
| HTML5 | Structure and layout |
| CSS3 | Styling and responsive design |
| TypeScript | Type-safe logic |
| React | UI framework |
| Vite | Build tool |
| Recharts | Charts and visualization |
| Framer Motion | Animations |
| html2canvas | PNG export |
| exceljs | Excel export |

---

## 🚀 How to Run

```

git clone [https://github.com/adrianmehaj/lfu-cache-algorithm-implementation.git](https://github.com/adrianmehaj/lfu-cache-algorithm-implementation.git)
cd lfu-cache-algorithm-implementation
npm install
npm run dev

```

---

## 📚 Academic Context

This application was developed as part of a **Bachelor Thesis project** in the field of **algorithm design and system optimization**.

It demonstrates:

- Practical implementation of cache replacement heuristics  
- Performance analysis under controlled workloads  
- Visualization of algorithm behavior  

---

## 👤 Author

**Adrian Mehaj**  
Bachelor Thesis Project

---
## 📄 License

This project is licensed under the MIT License — see the LICENSE file.
