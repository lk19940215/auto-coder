import {
  Container,
  Paper,
  Title,
  Text,
  Center,
  Group,
  Divider,
  ThemeIcon,
  SimpleGrid,
  Card,
  rem,
} from '@mantine/core'
import { IconListCheck, IconClock, IconTrash, IconCode } from '@tabler/icons-react'

export function AboutPage() {
  const features = [
    {
      icon: IconListCheck,
      title: '任务管理',
      description: '轻松添加、编辑和删除待办事项，保持任务井井有条',
    },
    {
      icon: IconClock,
      description: '快速筛选待办、进行中和已完成的任务',
      title: '状态筛选',
    },
    {
      icon: IconTrash,
      title: '简洁界面',
      description: '直观的 UI 设计，让您专注于重要事项',
    },
  ]

  return (
    <Container size="md" className="py-8">
      {/* 标题区域 */}
      <Center mb="xl">
        <div className="text-center">
          <Title order={1} className="heading-primary flex items-center justify-center gap-3">
            <IconCode size={40} stroke={1.5} />
            关于本项目
          </Title>
          <Text c="dimmed" size="lg">
            基于现代技术栈构建的 TODO 应用
          </Text>
        </div>
      </Center>

      {/* 项目介绍卡片 */}
      <Paper p="lg" radius="lg" shadow="md" mb="lg" className="card-custom">
        <Title order={2} mb="md">项目简介</Title>
        <Text lh={1.8}>
          这是一个简约而强大的待办事项管理应用，旨在帮助您高效地组织和跟踪日常任务。
          通过直观的界面和流畅的交互体验，让任务管理变得轻松愉快。
        </Text>
        <Divider my="lg" />
        <Title order={3} mb="md">技术栈</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Card padding="lg" radius="md" withBorder>
            <Group gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconCode style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ThemeIcon>
              <div>
                <Text fw={500}>前端</Text>
                <Text size="sm" c="dimmed">React 18 + TypeScript + Vite</Text>
              </div>
            </Group>
          </Card>
          <Card padding="lg" radius="md" withBorder>
            <Group gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconListCheck style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ThemeIcon>
              <div>
                <Text fw={500}>UI 库</Text>
                <Text size="sm" c="dimmed">Mantine v7 + Tailwind CSS</Text>
              </div>
            </Group>
          </Card>
          <Card padding="lg" radius="md" withBorder>
            <Group gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconClock style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ThemeIcon>
              <div>
                <Text fw={500}>状态管理</Text>
                <Text size="sm" c="dimmed">Zustand + Axios</Text>
              </div>
            </Group>
          </Card>
          <Card padding="lg" radius="md" withBorder>
            <Group gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconTrash style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
              </ThemeIcon>
              <div>
                <Text fw={500}>后端</Text>
                <Text size="sm" c="dimmed">Node.js + Express</Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* 功能特性 */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="lg">
        {features.map((feature) => (
          <Paper
            key={feature.title}
            p="lg"
            radius="lg"
            shadow="md"
            className="card-custom"
            style={{ textAlign: 'center' }}
          >
            <ThemeIcon variant="light" size="xl" radius="xl" mb="md">
              <feature.icon style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
            </ThemeIcon>
            <Title order={4} mb="xs">{feature.title}</Title>
            <Text size="sm" c="dimmed">{feature.description}</Text>
          </Paper>
        ))}
      </SimpleGrid>
    </Container>
  )
}
