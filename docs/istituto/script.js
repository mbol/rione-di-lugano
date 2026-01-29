// CONFIGURATION
const startDate = new Date('2026-01-27'); // YYYY-MM-DD

// Now each rule can have its own time
// { weekday: <0-6>, count: <number>, time: 'HH:MM' }
const scheduleRules = [
    { weekday: 1, count: 1, time: '19:00' }, // 3 Mondays at 19:00
    { weekday: 3, count: 3, time: '19:00' }, // 2 Wednesdays at 18:30
    // Add more rules as needed
];

const teacher = '';

function getNextWeekday(date, weekday) {
    const result = new Date(date);
    result.setDate(result.getDate() + ((7 + weekday - result.getDay()) % 7));
    return result;
}

function formatDate(date) {
    return date.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function generateSchedule(startDate, rules, teacher) {
    let schedule = [];
    let currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    rules.forEach(rule => {
        let date = getNextWeekday(currentDate, rule.weekday);
        for (let i = 0; i < rule.count; i++) {
            if (date >= today) {
                schedule.push({
                    date: formatDate(date),
                    time: rule.time,
                    teacher
                });
            }
            date.setDate(date.getDate() + 7);
        }
        // Move currentDate forward for the next rule
        currentDate = new Date(date);
    });

    return schedule;
}

function renderSchedule(schedule) {
    const ul = document.querySelector('.schedule-list');
    ul.innerHTML = '';
    schedule.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="date">${item.date}</span>
            <span class="time">${item.time}</span>
            <span class="teacher">${item.teacher}</span>
        `;
        ul.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const schedule = generateSchedule(startDate, scheduleRules, teacher);
    renderSchedule(schedule);
    console.log("Landing page loaded");
});