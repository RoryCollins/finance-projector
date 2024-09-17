import { GetNormallyDistributedRandomNumber } from "./distribution";

it("Generates random numbers in a normal distribution", () => {
    const randomNumbers = Array.from({ length: 10000 }, () => GetNormallyDistributedRandomNumber(0, 1));

    const randomNumbersWithinOneStandardDeviation = randomNumbers.filter(i => i < 1.0 && i > -1).length;
    const randomNumbersWithinTwoStandardDeviations = randomNumbers.filter(i => i < 2.0 && i > -2).length;

    //Expect Approx. 68%, allow 2% for tolerance
    expect(randomNumbersWithinOneStandardDeviation).toBeGreaterThanOrEqual(6600);
    expect(randomNumbersWithinOneStandardDeviation).toBeLessThanOrEqual(7000);

    //Expect Approx. 95%, allow 2% for tolerance
    expect(randomNumbersWithinTwoStandardDeviations).toBeGreaterThanOrEqual(9300);
    expect(randomNumbersWithinTwoStandardDeviations).toBeLessThanOrEqual(9700);
});