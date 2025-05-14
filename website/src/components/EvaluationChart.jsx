import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function EvaluationChart({ evaluations }) {
    if (!evaluations || evaluations.length === 0) return null;

    // Agrupar por hora (YYYY-MM-DD HH:00)
    const grouped = {};
    evaluations.forEach(({ created_at, is_bot }) => {
        const date = new Date(created_at);
        const hourKey = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH

        if (!grouped[hourKey]) {
            grouped[hourKey] = { hour: hourKey.replace('T', ' '), bots: 0, humans: 0 };
        }

        if (is_bot) grouped[hourKey].bots += 1;
        else grouped[hourKey].humans += 1;
    });

    const data = Object.values(grouped).sort((a, b) => a.hour.localeCompare(b.hour));

    return (
        <div style={{ marginTop: '2rem', width: '100%', height: '400px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Evaluation History (per hour)</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" angle={-45} textAnchor="end" height={70} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bots" stroke="#ff4d4f" name="Bots" strokeWidth={2} />
                    <Line type="monotone" dataKey="humans" stroke="#52c41a" name="Humans" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
