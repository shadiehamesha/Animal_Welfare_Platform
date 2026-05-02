import cron from 'node-cron';
import Pet from '../models/pet.model.js';
import Alert from '../models/alert.model.js';

export const startCronJobs = () => {
    // Run daily at 00:00 to check for upcoming vaccinations
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('[CRON] Running daily immunization check...');
            const upcomingDate = new Date();
            upcomingDate.setDate(upcomingDate.getDate() + 3);

            // Find user-owned pets with pending vaccines due in the next 3 days
            const pets = await Pet.find({
                owner: { $ne: null },
                vaccinationSchedule: {
                    $elemMatch: {
                        status: 'Pending',
                        dueDate: { 
                            $gte: new Date(), 
                            $lte: upcomingDate 
                        }
                    }
                }
            });

            for (const pet of pets) {
                const upcomingVax = pet.vaccinationSchedule.find(v => v.status === 'Pending' && new Date(v.dueDate) <= upcomingDate);
                if (upcomingVax) {
                    await Alert.create({
                        type: 'Immunization Reminder',
                        message: `Reminder: ${pet.name} is due for their ${upcomingVax.vaccineName} vaccine on ${new Date(upcomingVax.dueDate).toLocaleDateString()}.`,
                        targetUser: pet.owner,
                        expiresAt: upcomingVax.dueDate
                    });
                }
            }
        } catch (error) {
            console.error('[CRON Error] Failed to process immunizations:', error);
        }
    });
};