import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button组件', () => {
  test('渲染Button组件', () => {
    render(<Button>测试按钮</Button>);
    expect(screen.getByText('测试按钮')).toBeInTheDocument();
  });

  test('渲染不同变体的Button', () => {
    render(
      <>
        <Button variant="primary">主要按钮</Button>
        <Button variant="secondary">次要按钮</Button>
        <Button variant="danger">危险按钮</Button>
        <Button variant="ghost">幽灵按钮</Button>
      </>
    );
    expect(screen.getByText('主要按钮')).toBeInTheDocument();
    expect(screen.getByText('次要按钮')).toBeInTheDocument();
    expect(screen.getByText('危险按钮')).toBeInTheDocument();
    expect(screen.getByText('幽灵按钮')).toBeInTheDocument();
  });

  test('渲染不同尺寸的Button', () => {
    render(
      <>
        <Button size="sm">小按钮</Button>
        <Button size="md">中按钮</Button>
        <Button size="lg">大按钮</Button>
      </>
    );
    expect(screen.getByText('小按钮')).toBeInTheDocument();
    expect(screen.getByText('中按钮')).toBeInTheDocument();
    expect(screen.getByText('大按钮')).toBeInTheDocument();
  });

  test('Button点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击按钮</Button>);
    fireEvent.click(screen.getByText('点击按钮'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('禁用状态的Button', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>禁用按钮</Button>);
    const button = screen.getByText('禁用按钮');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('加载状态的Button', () => {
    render(<Button loading>加载按钮</Button>);
    const button = screen.getByText('加载按钮');
    expect(button).toBeDisabled();
  });
});
