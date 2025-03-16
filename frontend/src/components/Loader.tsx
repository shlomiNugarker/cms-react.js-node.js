import { Progress } from "@radix-ui/react-progress";

export const Loader = ({ value = 33 }: { value: number }) => {
  return (
    <div className="flex justify-center items-center">
      <Progress value={value} />
    </div>
  );
};
